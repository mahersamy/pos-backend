import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffRepository } from '../../DB/Repository/staff.repository';
import type { UserDocument } from 'src/DB/Models/users.model';
import { GetAllStaffDto } from './dto/get-all-staff.dto';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';

// staff/staff.service.ts
import {
  STAFF_SELECT,
  STAFF_POPULATE,
} from '../../DB/Repository/staff.repository';

// Reusable options object
const STAFF_QUERY_OPTIONS = {
  select: STAFF_SELECT,
  populate: STAFF_POPULATE,
};

@Injectable()
export class StaffService {
  constructor(
    private readonly _staffRepository: StaffRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(createStaffDto: CreateStaffDto, user: UserDocument) {
    const existingStaff = await this._staffRepository.findOne({
      email: createStaffDto.email,
    });
    if (existingStaff) {
      throw new ConflictException('Staff with this email already exists');
    }

    // ✅ create and return with select applied
    const staff = await this._staffRepository.createAndReturn({
      ...createStaffDto,
      createdBy: user._id,
    });

    return staff;
  }

  // ─── GET ALL ──────────────────────────────────────────────────────────────
  async findAll(query: GetAllStaffDto) {
    const { page, limit, sort, search } = query;

    const filter = search
      ? {
          $or: [
            { fullname: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } },
            ...(isValidObjectId(search) ? [{ _id: search }] : []),
          ],
        }
      : {};

    return await this._staffRepository.paginate(filter, {
      page,
      limit,
      sort: sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 },
      ...STAFF_QUERY_OPTIONS, // ✅ reuse
    });
  }

  // ─── GET ONE ──────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const staff = await this._staffRepository.findById(
      id,
      {},
      STAFF_QUERY_OPTIONS, // ✅ reuse
    );
    if (!staff) throw new NotFoundException('Staff not found');
    return staff;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const staff = await this._staffRepository.findById(id);
    if (!staff) throw new NotFoundException('Staff not found');

    if (updateStaffDto.email && updateStaffDto.email !== staff.email) {
      const emailExists = await this._staffRepository.findOne({
        email: updateStaffDto.email,
        _id: { $ne: id },
      });
      if (emailExists) {
        throw new ConflictException('Email already in use by another staff member');
      }
    }

    const updated = await this._staffRepository.findByIdAndUpdate(
      id,
      updateStaffDto,
      STAFF_QUERY_OPTIONS, // ✅ reuse
    );

    return updated;
  }

  // ─── ADD / REPLACE IMAGE ──────────────────────────────────────────────────
  async addImage(id: string, image: Express.Multer.File) {
    const staff = await this._staffRepository.findById(id);
    if (!staff) throw new NotFoundException('Staff not found');
    if (!image) throw new BadRequestException('No image provided');

    if (staff.profilePicture?.public_id) {
      await this.cloudinaryService.deleteFile(
        String(staff.profilePicture.public_id),
      );
    }

    const [uploaded] = await this.cloudinaryService.uploadFiles([image], {
      folder: 'staff',
      quality: 60,
      toWebp: true,
    });

    const updated = await this._staffRepository.findByIdAndUpdate(
      id,
      {
        profilePicture: {
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
        },
      },
      STAFF_QUERY_OPTIONS, // ✅ reuse
    );

    return updated;
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async remove(id: string) {
    const staff = await this._staffRepository.findById(id);
    if (!staff) throw new NotFoundException('Staff not found');

    if (staff.profilePicture?.public_id) {
      await this.cloudinaryService.deleteFile(
        String(staff.profilePicture.public_id),
      );
    }

    await this._staffRepository.findByIdAndDelete(id);
    return 'Staff deleted successfully';
  }
}

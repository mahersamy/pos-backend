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

@Injectable()
export class StaffService {
  constructor(
    private readonly _staffRepository: StaffRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async create(createStaffDto: CreateStaffDto, user: UserDocument) {
    console.log(user.permissions);
    const existingStaff = await this._staffRepository.findOne({
      email: createStaffDto.email,
    });
    if (existingStaff) {
      throw new ConflictException('Staff with this email already exists');
    }

    await this._staffRepository.create({
      ...createStaffDto,
      createdBy: user._id,
    });

    return 'Staff created successfully';
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
      populate: {
        path: 'createdBy',
        select: 'firstName lastName email',
      },
      select: 'fullname email position phoneNumber salary profilePicture.secure_url startShiftTiming endShiftTiming',
    });
  }

  // ─── GET ONE ──────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const staff = await this._staffRepository.findById(id,{},{
      populate: {
        path: 'createdBy',
        select: 'firstName lastName email',
      },
      select: 'fullname email position phoneNumber salary profilePicture.secure_url startShiftTiming endShiftTiming',
    });
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }
    return staff;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const staff = await this._staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

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
    );

    return { message: 'Staff updated successfully', data: updated };
  }

  // ─── ADD / REPLACE IMAGE ──────────────────────────────────────────────────
  async addImage(id: string, image: Express.Multer.File) {
    const staff = await this._staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (!image) {
      throw new BadRequestException('No image provided');
    }

    // Delete old image from Cloudinary if it exists
    if (staff.profilePicture?.public_id) {
      await this.cloudinaryService.deleteFile(
        staff.profilePicture.public_id as string,
      );
    }

    const [uploaded] = await this.cloudinaryService.uploadFiles([image], {
      folder: 'staff',
      quality: 60,
      toWebp: true,
    });

     await this._staffRepository.findByIdAndUpdate(
      id,
      {
        profilePicture: {
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
        },
      },
    );

    return 'Image uploaded successfully' ;
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async remove(id: string) {
    const staff = await this._staffRepository.findById(id);
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    // Delete profile picture from Cloudinary if it exists
    if (staff.profilePicture) {
      await this.cloudinaryService.deleteFile(staff.profilePicture.public_id as string);
    }

    await this._staffRepository.findByIdAndDelete(id);

    return { message: 'Staff deleted successfully' };
  }
}
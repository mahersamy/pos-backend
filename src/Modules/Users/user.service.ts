import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import {
  UserRepository,
  USER_QUERY_OPTIONS,
} from '../../DB/Repository/user.repository';
import {
  HashService,
  ROLE_DEFAULT_PERMISSIONS,
  EncryptionService,
} from 'src/common';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddPermissonDto } from './dto/add-permisson.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _hashService: HashService,
    private readonly _encryptionService: EncryptionService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── CREATE ───────────────────────────────────────────────────────────────
  async createUser(user: CreateUserDto) {
    const existingUser = await this._userRepository.findOne({
      email: user.email,
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const defaultPermissions = ROLE_DEFAULT_PERMISSIONS[user.role] ?? [];
    const hashedPassword = await this._hashService.hash(user.password);
    const encryptedPhoneNumber = await this._encryptionService.encrypt(
      user.phoneNumber,
    );

    const newUser = await this._userRepository.createAndReturn({
      ...user,
      password: hashedPassword,
      phoneNumber: encryptedPhoneNumber,
      permissions: defaultPermissions,
    });

    return {
      message: 'Create User Successfully',
      data: newUser,
    };
  }

  // ─── GET ALL ──────────────────────────────────────────────────────────────
  async findAll(query: GetAllUserDto) {
    const { page, limit, sort, search, role } = query;

    const filter: Record<string, any> = {};

    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        ...(isValidObjectId(search) ? [{ _id: search }] : []),
      ];
    }

    return this._userRepository.paginate(filter, {
      page,
      limit,
      sort: sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 },
      select: USER_QUERY_OPTIONS.select,
    });
  }

  // ─── GET ONE ──────────────────────────────────────────────────────────────
  async findOne(id: string) {
    const user = await this._userRepository.findById(
      id,
      {},
      USER_QUERY_OPTIONS,
    );
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateUserDto) {
    const user = await this._userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const emailExists = await this._userRepository.findOne({
        email: dto.email,
        _id: { $ne: id },
      });
      if (emailExists) {
        throw new ConflictException('Email already in use by another user');
      }
    }

    if (dto.phoneNumber) {
      dto.phoneNumber = await this._encryptionService.encrypt(dto.phoneNumber);
    }

    const updated = await this._userRepository.findByIdAndUpdate(
      id,
      dto,
      USER_QUERY_OPTIONS,
    );

    return updated;
  }

  // ─── ADD / REPLACE IMAGE ──────────────────────────────────────────────────
  async addImage(id: string, image: Express.Multer.File) {
    const user = await this._userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (!image) throw new BadRequestException('No image provided');

    const [uploaded] = await this.cloudinaryService.uploadFiles([image], {
      folder: 'users',
      quality: 60,
      toWebp: true,
    });

    const updated = await this._userRepository.findByIdAndUpdate(
      id,
      { profilePicture: uploaded.secure_url },
      USER_QUERY_OPTIONS,
    );

    return updated;
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async remove(id: string) {
    const user = await this._userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this._userRepository.findByIdAndDelete(id);
    return 'User deleted successfully';
  }

  // ─── ADD PERMISSIONS ──────────────────────────────────────────────────────
  async addPermissions(id: string, body: AddPermissonDto) {
    const user = await this._userRepository.findByIdAndUpdate(
      id,
      { permissions: body.permissions },
      USER_QUERY_OPTIONS,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

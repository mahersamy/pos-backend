import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import {
  HashService,
  ROLE_DEFAULT_PERMISSIONS,
} from '../../common';
import { USER_EVENTS, UserCreatedEvent } from './event/user-created.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { UserRepository } from './repository/user.repository';
import { USER_QUERY_OPTIONS } from './constants/user.constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AddPermissonDto } from './dto/add-permisson.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';
import { ChangeRoleDto } from './dto/change-role.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _hashService: HashService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

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

    const newUser = await this._userRepository.createAndReturn({
      ...user,
      password: hashedPassword,
      permissions: defaultPermissions,
    });

    this.eventEmitter.emit(
      USER_EVENTS.CREATED,
      new UserCreatedEvent({
        userId: newUser._id.toString(),
        email: user.email,
        password: user.password,
      }),
    );

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

    const updateData = { ...dto };


    const updated = await this._userRepository.findByIdAndUpdate(
      id,
      updateData,
      USER_QUERY_OPTIONS,
    );

    return updated;
  }

  // ─── ADD / REPLACE IMAGE ──────────────────────────────────────────────────
  async addImage(id: string, image: Express.Multer.File) {
    const user = await this._userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (!image) throw new BadRequestException('No image provided');

    if (user.profilePicture?.public_id) {
      await this.cloudinaryService.deleteFile(
        String(user.profilePicture.public_id),
      );
    }

    const [uploaded] = await this.cloudinaryService.uploadFiles([image], {
      folder: 'users',
      quality: 60,
      toWebp: true,
    });

    const updated = await this._userRepository.findByIdAndUpdate(
      id,
      {
        profilePicture: {
          secure_url: uploaded.secure_url,
          public_id: uploaded.public_id,
        },
      },
      USER_QUERY_OPTIONS,
    );

    return updated;
  }

  // ─── UPDATE PASSWORD ──────────────────────────────────────────────────────
  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this._userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await this._hashService.hash(dto.password);

    await this._userRepository.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      USER_QUERY_OPTIONS,
    );

    return { message: 'Password updated successfully' };
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  async remove(id: string) {
    const user = await this._userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (user.profilePicture?.public_id) {
      await this.cloudinaryService.deleteFile(
        String(user.profilePicture.public_id),
      );
    }

    await this._userRepository.findByIdAndDelete(id);
    return 'User deleted successfully';
  }

  // ─── CHANGE ROLE ──────────────────────────────────────────────────────────
  async changeRole(id: string, dto: ChangeRoleDto) {
    const user = await this._userRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const defaultPermissions = ROLE_DEFAULT_PERMISSIONS[dto.role] ?? {};

    const updated = await this._userRepository.findByIdAndUpdate(
      id,
      { role: dto.role, permissions: defaultPermissions },
      USER_QUERY_OPTIONS,
    );

    return updated;
  }

  // ─── ADD PERMISSIONS ──────────────────────────────────────────────────────
  async addPermissions(id: string, body: AddPermissonDto) {
    const user = await this._userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // const mergedPermissions = { ...user.permissions };

    // for (const [resource, actions] of Object.entries(body.permissions)) {
    //   mergedPermissions[resource] = {
    //     ...(mergedPermissions[resource] ?? {}),
    //     ...actions,
    //   };
    // }

    const updated = await this._userRepository.findByIdAndUpdate(
      id,
      { permissions: body.permissions },
      USER_QUERY_OPTIONS,
    );

    return updated;
  }

  getUserLoggedProfile() {

  }
}

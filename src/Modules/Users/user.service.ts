import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../DB/Repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { HashService, ROLE_DEFAULT_PERMISSIONS } from 'src/common';
import { EncryptionService } from 'src/common';
import { AddPermissonDto } from './dto/add-permisson.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _hashService: HashService,
    private readonly _encryptionService: EncryptionService,
  ) {}

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
    const newUser = await this._userRepository.create({
      ...user,
      password: hashedPassword,
      phoneNumber: encryptedPhoneNumber,
      permissions: defaultPermissions,
    });

    // Remove password from the returned object
    const { password: _, ...userResponse } = newUser.toObject();

    return {
      message: 'Create User Successfully',
      data: userResponse,
    };
  }

  async addPermissions(id: string, body: AddPermissonDto) {
    const user = await this._userRepository.findByIdAndUpdate(
      id,
      { permissions: body.permissions },
      { select: '-password' },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Permissions added successfully',
      data: user,
    };
  }
}

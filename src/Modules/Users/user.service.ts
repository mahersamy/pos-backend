import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../DB/Repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { HashService } from 'src/common';
import { EncryptionService } from 'src/common';

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
    const hashedPassword = await this._hashService.hash(user.password);
    const encryptedPhoneNumber = await this._encryptionService.encrypt(
      user.phoneNumber,
    );
    await this._userRepository.create({
      ...user,
      password: hashedPassword,
      phoneNumber: encryptedPhoneNumber,
    });

    return {
      message: 'Create User Successfully',
    };
  }
}

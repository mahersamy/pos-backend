import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginBodyDto, RegisterBodyDto } from './auth.dto';
import { UserRepository } from '../../DB/Repository/user.repository';
import { OtpType, TokenService } from '../../common';
import { HashService } from '../../common';
import { EncryptionService } from '../../common';
import { OtpRepository } from '../../DB/Repository/otp.repository';
import { emailEvent } from '../../common/utils/email/email.event';
import { generateOtp } from '../../common/utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly _userRepo: UserRepository,
    private readonly _otpRepo: OtpRepository,
    private readonly _hashService: HashService,
    private readonly _tokenService: TokenService,
    private readonly _encryptionService: EncryptionService,
  ) {}


  async login(user: LoginBodyDto) {
    const existingUser = await this._userRepo.findOne({ email: user.email });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    const isPasswordMatch = await this._hashService.verify(
      existingUser.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid password');
    }
    const accessToken = await this._tokenService.generateToken(
      { _id: existingUser._id,
        role: existingUser.role,
        permissions: existingUser.permissions,
       },
      { expiresIn: '1h', secret: process.env.JWT_SECRET_BEARER_ACCESS },
    );
    const refreshToken = await this._tokenService.generateToken(
      { _id: existingUser._id },
      { expiresIn: '1y', secret: process.env.JWT_SECRET_BEARER_REFRESH },
    );
    return {
      credential: {
        accessToken,
        refreshToken,
      },
    };
  }
}

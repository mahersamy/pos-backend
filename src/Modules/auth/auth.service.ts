import {
  BadRequestException,
  Injectable,

} from '@nestjs/common';
import { LoginBodyDto, RegisterBodyDto } from './auth.dto';
import { UserRepository } from '../users/repository/user.repository';
import { TokenService } from '../../common';
import { HashService } from '../../common';

@Injectable()
export class AuthService {
  constructor(
    private readonly _userRepo: UserRepository,
    private readonly _hashService: HashService,
    private readonly _tokenService: TokenService,
  ) {}

  async login(user: LoginBodyDto) {
    const existingUser = await this._userRepo.findOne({ email: user.email });
    if (!existingUser) {
      throw new BadRequestException('Invalid password or email');
    }
    const isPasswordMatch = await this._hashService.verify(
      existingUser.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid password or email');
    }
    const accessToken = await this._tokenService.generateToken(
      {
        _id: existingUser._id,
        role: existingUser.role,
        // permissions intentionally omitted — PermissionGuard reads the live
        // DB value attached by AuthGuard.decodeToken, not the JWT claim.
      },
      { expiresIn: '1y', secret: process.env.JWT_SECRET_BEARER_ACCESS },
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

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ForgotPasswordDto,
  LoginBodyDto,
  LogoutBodyDto,
  RegisterBodyDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto';
import { UserRepository } from '../users/repository/user.repository';
import { OtpRepository } from './repository/otp.repository';
import { HashService } from '../../common';
import { TokenService } from '../../common';
import { CacheHelperService } from '../../common/cache/cache.service';
import type { UserDocument } from '../users/models/users.model';
import { UserStatus } from '../users/enums/user-status.enum';
import { OtpType } from '../../common/Enums/otp.enum';
import { emailEvent } from '../../common/utils/email/email.event';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly _userRepo: UserRepository,
    private readonly _otpRepo: OtpRepository,
    private readonly _hashService: HashService,
    private readonly _tokenService: TokenService,
    @Optional()
    private readonly _cacheHelper?: CacheHelperService,
  ) {}

  /**
   * Helper to generate both Access and Refresh tokens
   */
  private async generateTokens(user: UserDocument) {
    const accessToken = await this._tokenService.generateToken(
      {
        _id: user._id,
        role: user.role,
        // permissions intentionally omitted — PermissionGuard reads the live
        // DB value attached by AuthGuard.decodeToken, not the JWT claim.
      },
      {
        expiresIn: Number(process.env.JWT_BEARER_ACCESS_EXP) || 3600,
        secret: process.env.JWT_SECRET_BEARER_ACCESS,
      },
    );
    const refreshToken = await this._tokenService.generateToken(
      { _id: user._id },
      {
        expiresIn: Number(process.env.JWT_REFRESH_BEARER_EXP) || 31536000,
        secret: process.env.JWT_SECRET_BEARER_REFRESH,
      },
    );
    return {
      credential: {
        accessToken,
        refreshToken,
      },
    };
  }

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  async login(user: LoginBodyDto) {
    const existingUser = await this._userRepo.findOne({
      email: user.email.toLowerCase().trim(),
    });
    if (!existingUser) {
      throw new BadRequestException('Invalid password or email');
    }
    if (existingUser.active === UserStatus.INACTIVE) {
      throw new BadRequestException('User account is inactive');
    }
    const isPasswordMatch = await this._hashService.verify(
      existingUser.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new BadRequestException('Invalid password or email');
    }
    return this.generateTokens(existingUser);
  }

  // ─── REFRESH TOKEN ────────────────────────────────────────────────────────
  async refreshToken(user: UserDocument, oldRefreshToken?: string) {
    if (user.active === UserStatus.INACTIVE) {
      throw new UnauthorizedException('User account is inactive');
    }
    // Refresh token rotation: invalidate the previous refresh token
    if (oldRefreshToken && this._cacheHelper) {
      const remainingTtl =
        Number(process.env.JWT_REFRESH_BEARER_EXP) || 31536000;
      await this._cacheHelper.blacklistToken(
        oldRefreshToken,
        remainingTtl * 1000,
      );
    }
    return this.generateTokens(user);
  }

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  async logout(
    user: UserDocument,
    authorization?: string,
    body?: LogoutBodyDto,
  ) {
    const accessToken = authorization?.split(' ')[1];

    // Blacklist access token
    if (accessToken && this._cacheHelper) {
      const remainingAccessTtl =
        Number(process.env.JWT_BEARER_ACCESS_EXP) || 3600;
      await this._cacheHelper.blacklistToken(
        accessToken,
        remainingAccessTtl * 1000,
      );
    }

    // Blacklist refresh token if provided
    if (body?.refreshToken && this._cacheHelper) {
      const remainingRefreshTtl =
        Number(process.env.JWT_REFRESH_BEARER_EXP) || 31536000;
      await this._cacheHelper.blacklistToken(
        body.refreshToken,
        remainingRefreshTtl * 1000,
      );
    }

    // Revoke all sessions across all devices if requested
    if (body?.allDevices) {
      await this._userRepo.findByIdAndUpdate(user._id, {
        changePasswordAt: new Date(),
      });
    }

    return {
      message: 'Logged out successfully',
    };
  }

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this._userRepo.findOne({ email });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    // Generate random 6-digit OTP
    const plainOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await this._hashService.hash(plainOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any active ResetPassword OTPs for this user
    await this._otpRepo.deleteMany({
      createdBy: new Types.ObjectId(user._id as any),
      type: OtpType.ResetPassword,
    });

    // Store new OTP
    await this._otpRepo.create({
      code: hashedOtp,
      expiresAt,
      createdBy: new Types.ObjectId(user._id as any),
      type: OtpType.ResetPassword,
    });

    // Send email asynchronously
    emailEvent.emit(
      'sendOtp',
      user.email,
      plainOtp,
      'Password Reset Code',
      'Password Reset',
    );

    return {
      message: 'Password reset OTP has been sent to your email',
    };
  }

  // ─── VERIFY OTP ───────────────────────────────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this._userRepo.findOne({ email });
    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const otpDoc = await this._otpRepo.findOne(
      {
        createdBy: new Types.ObjectId(user._id as any),
        type: OtpType.ResetPassword,
        expiresAt: { $gt: new Date() },
      },
      undefined,
      { sort: { createdAt: -1 } },
    );

    if (!otpDoc) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isMatch = await this._hashService.verify(otpDoc.code, dto.otp);
    if (!isMatch) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return {
      message: 'OTP verified successfully',
    };
  }

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this._userRepo.findOne({ email });
    if (!user) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const otpDoc = await this._otpRepo.findOne(
      {
        createdBy: new Types.ObjectId(user._id as any),
        type: OtpType.ResetPassword,
        expiresAt: { $gt: new Date() },
      },
      undefined,
      { sort: { createdAt: -1 } },
    );

    if (!otpDoc) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isMatch = await this._hashService.verify(otpDoc.code, dto.otp);
    if (!isMatch) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashedPassword = await this._hashService.hash(dto.password);

    // Update user password and set changePasswordAt to invalidate any old sessions
    await this._userRepo.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      changePasswordAt: new Date(),
    });

    // Delete used OTP
    await this._otpRepo.deleteMany({
      createdBy: new Types.ObjectId(user._id as any),
      type: OtpType.ResetPassword,
    });

    return {
      message: 'Password has been reset successfully',
    };
  }
}

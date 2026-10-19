import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthCredentialResponseDto,
  AuthMessageResponseDto,
  ForgotPasswordDto,
  LoginBodyDto,
  LogoutBodyDto,
  RefreshTokenDto,
  ResetPasswordDto,
  VerifyOtpDto,
} from './dto';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import { AuthUser } from '../../common/Decorators/authUser.decorator';
import { tokenTypeEnum } from '../../common/Enums/tokeType.enum';
import type { UserDocument } from '../users/models/users.model';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticates user with email and password, returning access and refresh JWT tokens.',
  })
  @ApiOkResponse({
    type: AuthCredentialResponseDto,
    description: 'User authenticated successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid password or email / inactive account',
  })
  login(@Body() body: LoginBodyDto) {
    return this._authService.login(body);
  }

  // ─── REFRESH TOKEN ────────────────────────────────────────────────────────
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @AuthApply({ tokenType: tokenTypeEnum.Refresh, roles: [] })
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generates a new access token and rotated refresh token using a valid refresh token (via Authorization Bearer header or request body).',
  })
  @ApiOkResponse({
    type: AuthCredentialResponseDto,
    description: 'Tokens refreshed successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing refresh token' })
  refreshToken(
    @AuthUser() user: UserDocument,
    @Headers('authorization') authorization?: string,
    @Body() body?: RefreshTokenDto,
  ) {
    const rawToken = authorization?.split(' ')[1] || body?.refreshToken;
    return this._authService.refreshToken(user, rawToken);
  }

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @AuthApply({ tokenType: tokenTypeEnum.Access, roles: [] })
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'User logout',
    description:
      'Revokes the current access token and optional refresh token. If allDevices is true, revokes all sessions across all devices.',
  })
  @ApiOkResponse({
    type: AuthMessageResponseDto,
    description: 'User logged out successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing access token',
  })
  logout(
    @AuthUser() user: UserDocument,
    @Headers('authorization') authorization?: string,
    @Body() body?: LogoutBodyDto,
  ) {
    return this._authService.logout(user, authorization, body);
  }

  // ─── LOGOUT ALL (CONVENIENCE ROUTE) ───────────────────────────────────────
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @AuthApply({ tokenType: tokenTypeEnum.Access, roles: [] })
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Logout from all devices',
    description:
      'Revokes all active sessions and tokens for this user across all devices.',
  })
  @ApiOkResponse({
    type: AuthMessageResponseDto,
    description: 'User logged out from all devices successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing access token',
  })
  logoutAll(
    @AuthUser() user: UserDocument,
    @Headers('authorization') authorization?: string,
  ) {
    return this._authService.logout(user, authorization, { allDevices: true });
  }

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Forgot password - request OTP',
    description:
      'Generates a 6-digit OTP code and emails it to the registered user email address.',
  })
  @ApiOkResponse({
    type: AuthMessageResponseDto,
    description: 'OTP sent to email successfully',
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this._authService.forgotPassword(body);
  }

  // ─── VERIFY OTP ───────────────────────────────────────────────────────────
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify password reset OTP',
    description:
      'Validates that the provided 6-digit OTP is correct and has not expired.',
  })
  @ApiOkResponse({
    type: AuthMessageResponseDto,
    description: 'OTP verified successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid or expired OTP' })
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this._authService.verifyOtp(body);
  }

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset password with OTP',
    description:
      'Resets the user password after verifying the 6-digit OTP, and revokes all older active sessions.',
  })
  @ApiOkResponse({
    type: AuthMessageResponseDto,
    description: 'Password reset successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired OTP, or passwords do not match',
  })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this._authService.resetPassword(body);
  }
}

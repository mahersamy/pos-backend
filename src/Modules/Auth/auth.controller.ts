import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginBodyDto, RegisterBodyDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}



  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: LoginBodyDto) {
    return this._authService.login(body);
  }
}

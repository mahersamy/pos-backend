import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '../users/repository/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../users/models/users.model';
import { HashService } from '../../common';
import { EncryptionService } from '../../common';
import { TokenService } from '../../common';
import { JwtService } from '@nestjs/jwt';
import { OtpRepository } from './repository/otp.repository';
import { OtpSchema } from './model/otp.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Otp', schema: OtpSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpRepository,
    UserRepository,
    HashService,
    EncryptionService,
    TokenService,
    JwtService,
  ],
})
export class AuthModule {}

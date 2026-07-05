import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '../../DB/Repository/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../../DB/Models/users.model';
import { HashService } from '../../common';
import { EncryptionService } from '../../common';
import { TokenService } from '../../common';
import { JwtService } from '@nestjs/jwt';
import { OtpRepository } from '../../DB/Repository/otp.repository';
import { OtpSchema } from '../../DB/Models/otp.model';

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

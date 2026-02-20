import { Module } from '@nestjs/common';
import { UserRepository } from '../../DB/Repository/user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../../DB/Models/users.model';
import { HashService } from '../../common';
import { EncryptionService } from '../../common';
import { TokenService } from '../../common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    HashService,
    EncryptionService,
    TokenService,
    JwtService,
  ],
})
export class UserModule {}

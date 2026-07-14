import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { HashService, EncryptionService, TokenService } from '../../common';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './models/users.model';
import { UserRepository } from './repository/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    HashService,
    EncryptionService,
    TokenService,
    JwtService,
    CloudinaryService,
  ],
  exports: [UserRepository]
})
export class UserModule { }

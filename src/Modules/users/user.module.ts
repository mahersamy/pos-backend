import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User, UserSchema } from '../../DB/Models/users.model';
import { UserRepository } from '../../DB/Repository/user.repository';
import { HashService, EncryptionService, TokenService } from '../../common';
import { CloudinaryService } from '../../common/services/cloudinary/cloudinary.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';

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
})
export class UserModule {}

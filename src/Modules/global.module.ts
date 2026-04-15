import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenService } from '../common';
import { User, UserSchema } from '../DB/Models/users.model';
import { UserRepository } from '../DB/Repository/user.repository';
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserRepository, TokenService, JwtService],
  exports: [UserRepository, TokenService, JwtService],
})
export class GlobalModule {}

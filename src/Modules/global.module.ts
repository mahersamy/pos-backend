import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenService } from '../common';
import { User, UserSchema } from '../DB/Models/users.model';
import { UserRepository } from '../DB/Repository/user.repository';
import { NotificationModule } from './notification/notification.module';
import { StaffModule } from './staff/staff.module';
import { CategoryModule } from './category/category.module';
import { MenuModule } from './menu/menu.module';
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationModule,
    StaffModule,
    CategoryModule,
    MenuModule,
  ],
  providers: [UserRepository, TokenService, JwtService],
  exports: [UserRepository, TokenService, JwtService],
})
export class GlobalModule {}

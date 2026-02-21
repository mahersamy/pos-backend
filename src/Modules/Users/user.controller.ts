import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthUser, ParamIdDto, Role, tokenTypeEnum } from '../../common';

import { User } from '../../DB/Models/users.model';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import { UserProfileResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { AddPermissonDto } from './dto/add-permisson.dto';

@AuthApply({ tokenType: tokenTypeEnum.Access, roles: [Role.ADMIN] })
@Controller('users')
export class UserController {
  constructor(private readonly _userService: UserService) {}


  
@AuthApply({ tokenType: tokenTypeEnum.Access, roles: [] })
  @Get('profile')
  profile(@AuthUser() user: User) {
   return user;
    // return plainToInstance(UserProfileResponseDto, user, {
    //   excludeExtraneousValues: true,
    // });
  }

  @Patch(":id/permissions")
  updatePermissions(@Param() { id }: ParamIdDto, @Body() body: AddPermissonDto) {
    return this._userService.addPermissions(id, body);
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this._userService.createUser(body);
  }

}

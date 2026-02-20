import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthUser, Role, tokenTypeEnum } from '../../common';

import { User } from '../../DB/Models/users.model';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import { UserProfileResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';

@AuthApply({ tokenType: tokenTypeEnum.Access, roles: [Role.ADMIN] })
@Controller('users')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Get('profile')
  profile(@AuthUser() user: User): UserProfileResponseDto {
    return plainToInstance(UserProfileResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  create(@Body() body: CreateUserDto) {
    return this._userService.createUser(body);
  }

}

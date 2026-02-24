import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  Action,
  AuthUser,
  CheckPermissions,
  FilesUpload,
  ParamIdDto,
  Resource,
  Role,
  tokenTypeEnum,
  UploadedFilesValidated,
} from '../../common';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import type { UserDocument } from '../../DB/Models/users.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddPermissonDto } from './dto/add-permisson.dto';
import { GetAllUserDto } from './dto/get-all-user.dto';

@AuthApply({ tokenType: tokenTypeEnum.Access, roles: [Role.ADMIN] })
@Controller('users')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  // ─── PROFILE (no role restriction) ───────────────────────────────────────
  @AuthApply({ tokenType: tokenTypeEnum.Access, roles: [] })
  @Get('profile')
  profile(@AuthUser() user: UserDocument) {
    const {firstName ,lastName ,email ,phoneNumber ,role,permissions ,profilePicture ,_id} = user;
    return {firstName ,lastName ,email ,phoneNumber ,role,permissions ,profilePicture ,_id};
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  @Post()
  create(@Body() body: CreateUserDto) {
    return this._userService.createUser(body);
  }

  // ─── GET ALL ──────────────────────────────────────────────────────────────
  @Get()
  findAll(@Query() query: GetAllUserDto) {
    return this._userService.findAll(query);
  }

  // ─── GET ONE ──────────────────────────────────────────────────────────────
  @Get(':id')
  findOne(@Param() { id }: ParamIdDto) {
    return this._userService.findOne(id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @Patch(':id')
  update(@Param() { id }: ParamIdDto, @Body() dto: UpdateUserDto) {
    return this._userService.update(id, dto);
  }

  // ─── ADD IMAGE ────────────────────────────────────────────────────────────
  @FilesUpload({ fieldName: 'image' })
  @Patch(':id/image')
  addImage(
    @Param() { id }: ParamIdDto,
    @UploadedFilesValidated() images: Express.Multer.File[],
  ) {
    return this._userService.addImage(id, images[0]);
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this._userService.remove(id);
  }

  // ─── PERMISSIONS ──────────────────────────────────────────────────────────
  @Patch(':id/permissions')
  updatePermissions(
    @Param() { id }: ParamIdDto,
    @Body() body: AddPermissonDto,
  ) {
    return this._userService.addPermissions(id, body);
  }
}

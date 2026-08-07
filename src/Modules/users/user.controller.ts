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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  AuthUser,
  FilesUpload,
  ParamIdDto,
  tokenTypeEnum,
  UploadedFilesValidated,
} from '../../common';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { UpdatePasswordDto } from './dto/request/update-password.dto';
import { AddPermissonDto } from './dto/request/add-permisson.dto';
import { GetAllUserDto } from './dto/request/get-all-user.dto';
import { ChangeRoleDto } from './dto/request/change-role.dto';
import { UserProfileResponseDto, UserResponseDto, PaginatedUserResponseDto } from './dto/response/user-response.dto';
import type { UserDocument } from './models/users.model';
import { Role } from '../../common/Enums/role.enum';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
@ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
@AuthApply({ tokenType: tokenTypeEnum.Access, roles: [Role.ADMIN] })
@Controller('users')
export class UserController {
  constructor(private readonly _userService: UserService) { }

  // ─── PROFILE (no role restriction) ───────────────────────────────────────
  @AuthApply({ tokenType: tokenTypeEnum.Access, roles: [] })
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the profile details of the currently authenticated user.' })
  @ApiOkResponse({ type: UserProfileResponseDto, description: 'User profile details retrieved successfully' })
  profile(@AuthUser() user: UserDocument) {
    const {
      firstName,
      lastName,
      email,
      role,
      permissions,
      profilePicture,
      age,
      address,
      _id,
    } = user;
    return {
      firstName,
      lastName,
      email,
      role,
      permissions,
      profilePicture: profilePicture?.secure_url ?? null,
      age,
      address,
      _id,
    } as any;
  }

  // ─── CREATE ───────────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: 'Create new user', description: 'Creates a new user account (Admin only).' })
  @ApiCreatedResponse({ type: UserResponseDto, description: 'User successfully created' })
  create(@Body() body: CreateUserDto) {
    return this._userService.createUser(body);
  }

  // ─── GET ALL ──────────────────────────────────────────────────────────────
  @Get()
  @ApiOperation({ summary: 'Get paginated users list', description: 'Retrieves all user records with pagination, sorting, and filter options.' })
  @ApiOkResponse({ type: PaginatedUserResponseDto, description: 'List of users' })
  findAll(@Query() query: GetAllUserDto) {
    return this._userService.findAll(query);
  }

  // ─── GET ONE ──────────────────────────────────────────────────────────────
  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID', description: 'Retrieves the complete profile of a user by their unique ID.' })
  @ApiOkResponse({ type: UserResponseDto, description: 'User details' })
  @ApiNotFoundResponse({ description: 'User not found' })
  findOne(@Param() { id }: ParamIdDto) {
    return this._userService.findOne(id);
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile details', description: 'Updates details like name, address, age, etc.' })
  @ApiOkResponse({ type: UserResponseDto, description: 'User successfully updated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  update(@Param() { id }: ParamIdDto, @Body() dto: UpdateUserDto) {
    return this._userService.update(id, dto);
  }

  // ─── UPDATE PASSWORD ──────────────────────────────────────────────────────
  @Patch(':id/password')
  @ApiOperation({ summary: 'Update user password', description: 'Updates a user password.' })
  @ApiOkResponse({ description: 'Password successfully updated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  updatePassword(
    @Param() { id }: ParamIdDto,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this._userService.updatePassword(id, dto);
  }

  // ─── ADD IMAGE ────────────────────────────────────────────────────────────
  @FilesUpload({ fieldName: 'image' })
  @Patch(':id/image')
  @ApiOperation({ summary: 'Upload user profile image', description: 'Uploads or replaces the user profile picture.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Profile image file',
        },
      },
    },
  })
  @ApiOkResponse({ type: UserResponseDto, description: 'Image uploaded successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  addImage(
    @Param() { id }: ParamIdDto,
    @UploadedFilesValidated({ fileIsRequired: true })
    images: Express.Multer.File[],
  ) {
    return this._userService.addImage(id, images?.[0]);
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user', description: 'Deletes a user account.' })
  @ApiOkResponse({ description: 'User successfully deleted' })
  @ApiNotFoundResponse({ description: 'User not found' })
  remove(@Param() { id }: ParamIdDto) {
    return this._userService.remove(id);
  }

  // ─── CHANGE ROLE ──────────────────────────────────────────────────────────
  @Patch(':id/role')
  @ApiOperation({ summary: 'Change user role', description: 'Changes user system access level (e.g. manager, staff, admin).' })
  @ApiOkResponse({ type: UserResponseDto, description: 'User role successfully changed' })
  @ApiNotFoundResponse({ description: 'User not found' })
  changeRole(@Param() { id }: ParamIdDto, @Body() dto: ChangeRoleDto) {
    return this._userService.changeRole(id, dto);
  }

  // ─── PERMISSIONS ────────────────────────────────────────────────────────────
  @Patch(':id/permissions')
  @ApiOperation({ summary: 'Update user permissions', description: 'Updates granular access rights for a user.' })
  @ApiOkResponse({ type: UserResponseDto, description: 'Permissions successfully updated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  updatePermissions(
    @Param() { id }: ParamIdDto,
    @Body() body: AddPermissonDto,
  ) {
    return this._userService.addPermissions(id, body);
  }
}

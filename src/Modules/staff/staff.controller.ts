import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/request/create-staff.dto';
import { UpdateStaffDto } from './dto/request/update-staff.dto';
import {
  Action,
  AuthUser,
  CheckPermissions,
  FilesUpload,
  ParamIdDto,
  Resource,
  Role,
  UploadedFilesValidated,
} from '../../common';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import type { UserDocument } from '../users/models/users.model';
import { GetAllStaffDto } from './dto/request/get-all-staff.dto';
import { DeleteManyStaffDto } from './dto/request/delete-many-staff.dto';
import { StaffResponseDto, PaginatedStaffResponseDto } from './dto/response/staff-response.dto';

@ApiTags('Staff')
@ApiBearerAuth('access-token')
@AuthApply({ roles: [Role.ADMIN, Role.MANAGER] })
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) { }

  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.WRITE] })
  @Post()
  @ApiCreatedResponse({ type: StaffResponseDto, description: 'Staff successfully created' })
  create(
    @Body() createStaffDto: CreateStaffDto,
    @AuthUser() user: UserDocument,
  ): Promise<StaffResponseDto> {
    return this.staffService.create(createStaffDto, user) as any;
  }

  @CheckPermissions({
    resource: Resource.STAFF,
    actions: [Action.WRITE, Action.READ],
  })
  @FilesUpload({ fieldName: 'image' })
  @Patch(':id/image')
  @ApiOkResponse({ type: StaffResponseDto, description: 'Staff image uploaded successfully' })
  addImages(
    @Param() { id }: ParamIdDto,
    @UploadedFilesValidated({ fileIsRequired: true })
    images: Express.Multer.File[],
  ): Promise<StaffResponseDto> {
    return this.staffService.addImage(id, images?.[0]) as any;
  }
  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.READ] })
  @Get()
  @ApiOkResponse({ type: PaginatedStaffResponseDto, description: 'List of staff members' })
  findAll(@Query() query: GetAllStaffDto): Promise<PaginatedStaffResponseDto> {
    return this.staffService.findAll(query) as any;
  }

  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.READ] })
  @Get(':id')
  @ApiOkResponse({ type: StaffResponseDto, description: 'Staff member details' })
  findOne(@Param() { id }: ParamIdDto): Promise<StaffResponseDto> {
    return this.staffService.findOne(id) as any;
  }

  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.WRITE] })
  @Patch(':id')
  @ApiOkResponse({ type: StaffResponseDto, description: 'Staff successfully updated' })
  update(@Param() { id }: ParamIdDto, @Body() updateStaffDto: UpdateStaffDto): Promise<StaffResponseDto> {
    return this.staffService.update(id, updateStaffDto) as any;
  }

  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.DELETE] })
  @Delete('delete-many')
  removeMany(@Body() deleteManyDto: DeleteManyStaffDto) {
    return this.staffService.removeMany(deleteManyDto.ids);
  }

  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.DELETE] })
  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this.staffService.remove(id);
  }
}

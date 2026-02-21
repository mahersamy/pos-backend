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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import {
  Action,
  AuthUser,
  CheckPermissions,
  FilesUpload,
  ParamIdDto,
  Resource,
  Role,
  UploadedFilesValidated,
} from 'src/common';
import { AuthApply } from 'src/common/Decorators/authApply.decorator';
import type { UserDocument } from 'src/DB/Models/users.model';
import { GetAllStaffDto } from './dto/get-all-staff.dto';

@AuthApply({ roles: [Role.ADMIN, Role.MANAGER] })
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.WRITE] })
  @Post()
  create(
    @Body() createStaffDto: CreateStaffDto,
    @AuthUser() user: UserDocument,
  ) {
    return this.staffService.create(createStaffDto, user);
  }

  @CheckPermissions({
    resource: Resource.STAFF,
    actions: [Action.WRITE, Action.READ],
  })
  @FilesUpload({ fieldName: 'image' })
  @Patch(':id/image')
  addImages(
    @Param() { id }: ParamIdDto,
    @UploadedFilesValidated() images: Express.Multer.File[],
  ) {
    return this.staffService.addImage(id, images[0]);
  }
  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.READ] })
  @Get()
  findAll(@Query() query: GetAllStaffDto) {
    return this.staffService.findAll(query);
  }

  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.READ] })
  @Get(':id')
  findOne(@Param() { id }: ParamIdDto) {
    return this.staffService.findOne(id);
  }

  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.WRITE] })
  @Patch(':id')
  update(@Param() { id }: ParamIdDto, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @CheckPermissions({ resource: Resource.STAFF, actions: [Action.DELETE] })
  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this.staffService.remove(id);
  }
}

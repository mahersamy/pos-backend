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
  AuthUser,
  FilesUpload,
  ParamIdDto,
  Role,
  UploadedFilesValidated,
} from 'src/common';
import { AuthApply } from 'src/common/Decorators/authApply.decorator';
import type { UserDocument } from 'src/DB/Models/users.model';
import { GetAllStaffDto } from './dto/get-all-staff.dto';

@AuthApply({ roles: [Role.ADMIN] })
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  create(
    @Body() createStaffDto: CreateStaffDto,
    @AuthUser() user: UserDocument,
  ) {
    return this.staffService.create(createStaffDto, user);
  }

  @FilesUpload({ fieldName: 'image' })
  @Patch(':id/image')
  addImages(
    @Param() { id }: ParamIdDto,
    @UploadedFilesValidated() images: Express.Multer.File[],
  ) {
    return this.staffService.addImage(id, images[0]);
  }

  @Get()
  findAll(@Query() query: GetAllStaffDto) {
    return this.staffService.findAll(query);
  }

  @Get(':id')
  findOne(@Param() { id }: ParamIdDto) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  update(@Param() { id }: ParamIdDto, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this.staffService.remove(id);
  }
}

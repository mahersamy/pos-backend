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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { GetAllCategoryDto } from './dto/get-all-category.dto';
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

@AuthApply({ roles: [Role.ADMIN, Role.MANAGER] })
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.WRITE] })
  @Post()
  create(@Body() dto: CreateCategoryDto, @AuthUser() user: UserDocument) {
    return this.categoryService.create(dto, user);
  }

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.READ] })
  @Get()
  findAll(@Query() query: GetAllCategoryDto) {
    return this.categoryService.findAll(query);
  }

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.READ] })
  @Get(':id')
  findOne(@Param() { id }: ParamIdDto) {
    return this.categoryService.findOne(id);
  }

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.WRITE] })
  @Patch(':id')
  update(@Param() { id }: ParamIdDto, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.WRITE] })
  @FilesUpload({ fieldName: 'image', maxCount: 1 })
  @Patch(':id/image')
  addImage(
    @Param() { id }: ParamIdDto,
    @UploadedFilesValidated() images: Express.Multer.File[],
  ) {
    return this.categoryService.addImage(id, images[0]);
  }

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.DELETE] })
  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this.categoryService.remove(id);
  }
}

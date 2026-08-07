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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/request/create-category.dto';
import { UpdateCategoryDto } from './dto/request/update-category.dto';
import { GetAllCategoryDto } from './dto/request/get-all-category.dto';
import { CategoryResponseDto, PaginatedCategoryResponseDto } from './dto/response/category-response.dto';
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

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
@ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
@AuthApply({ roles: [Role.ADMIN, Role.MANAGER] })
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.WRITE] })
  @Post()
  @ApiOperation({ summary: 'Create a category', description: 'Creates a new menu/inventory category.' })
  @ApiCreatedResponse({ type: CategoryResponseDto, description: 'Category successfully created' })
  create(@Body() dto: CreateCategoryDto, @AuthUser() user: UserDocument) {
    return this.categoryService.create(dto, user);
  }

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.READ] })
  @Get()
  @ApiOperation({ summary: 'Get list of categories', description: 'Retrieves all categories with optional search, sorting, and pagination.' })
  @ApiOkResponse({ type: PaginatedCategoryResponseDto, description: 'List of categories retrieved successfully' })
  findAll(@Query() query: GetAllCategoryDto) {
    return this.categoryService.findAll(query);
  }

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.READ] })
  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID', description: 'Retrieves a single category detail by ID.' })
  @ApiOkResponse({ type: CategoryResponseDto, description: 'Category details' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  findOne(@Param() { id }: ParamIdDto) {
    return this.categoryService.findOne(id);
  }

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.WRITE] })
  @Patch(':id')
  @ApiOperation({ summary: 'Update category', description: 'Updates category info like name, description.' })
  @ApiOkResponse({ type: CategoryResponseDto, description: 'Category successfully updated' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  update(@Param() { id }: ParamIdDto, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.WRITE] })
  @FilesUpload({ fieldName: 'image', maxCount: 1 })
  @Patch(':id/image')
  @ApiOperation({ summary: 'Upload category image', description: 'Uploads or replaces image for a category.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Category image file',
        },
      },
    },
  })
  @ApiOkResponse({ type: CategoryResponseDto, description: 'Image successfully uploaded' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  addImage(
    @Param() { id }: ParamIdDto,
    @UploadedFilesValidated() images: Express.Multer.File[],
  ) {
    return this.categoryService.addImage(id, images[0]);
  }

  @CheckPermissions({ resource: Resource.CATEGORY, actions: [Action.DELETE] })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete category', description: 'Removes a category.' })
  @ApiOkResponse({ description: 'Category successfully deleted' })
  @ApiNotFoundResponse({ description: 'Category not found' })
  remove(@Param() { id }: ParamIdDto) {
    return this.categoryService.remove(id);
  }
}

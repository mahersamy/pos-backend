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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiConsumes } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/request/create-inventory.dto';
import { UpdateInventoryDto } from './dto/request/update-inventory.dto';
import { GetAllInventoryDto } from './dto/request/get-all-inventory.dto';
import {
  InventoryResponseDto,
  PaginatedInventoryResponseDto,
} from './dto/response/inventory-response.dto';
import {
  Action,
  AuthUser,
  CheckPermissions,
  FilesUpload,
  ParamIdDto,
  Resource,
  UploadedFilesValidated,
} from '../../common';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import type { UserDocument } from '../users/models/users.model';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@AuthApply({ roles: [] })
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiCreatedResponse({ description: 'Inventory item created successfully', type: InventoryResponseDto })
  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.WRITE] })
  @Post()
  create(@Body() dto: CreateInventoryDto, @AuthUser() user: UserDocument) {
    return this.inventoryService.create(dto, user);
  }

  @ApiOperation({ summary: 'Add or update inventory item image' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Image updated successfully', type: InventoryResponseDto })
  @CheckPermissions({
    resource: Resource.INVENTORY,
    actions: [Action.WRITE, Action.READ],
  })
  @FilesUpload({ fieldName: 'image' })
  @Patch(':id/image')
  addImages(
    @Param() { id }: ParamIdDto,
    @UploadedFilesValidated() images: Express.Multer.File[],
  ) {
    return this.inventoryService.addImage(id, images[0]);
  }

  @ApiOperation({ summary: 'Get all inventory items (paginated)' })
  @ApiOkResponse({ description: 'List of inventory items retrieved successfully', type: PaginatedInventoryResponseDto })
  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.READ] })
  @Get()
  findAll(@Query() query: GetAllInventoryDto) {
    return this.inventoryService.findAll(query);
  }

  @ApiOperation({ summary: 'Get an inventory item by ID' })
  @ApiOkResponse({ description: 'Inventory item retrieved successfully', type: InventoryResponseDto })
  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.READ] })
  @Get(':id')
  findOne(@Param() { id }: ParamIdDto) {
    return this.inventoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an inventory item by ID' })
  @ApiOkResponse({ description: 'Inventory item updated successfully', type: InventoryResponseDto })
  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.WRITE] })
  @Patch(':id')
  update(@Param() { id }: ParamIdDto, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  @ApiOperation({ summary: 'Delete an inventory item by ID' })
  @ApiOkResponse({ description: 'Inventory item deleted successfully' })
  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.DELETE] })
  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this.inventoryService.remove(id);
  }
}

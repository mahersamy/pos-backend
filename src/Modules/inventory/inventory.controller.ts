import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { GetAllInventoryDto } from './dto/get-all-inventory.dto';
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
import type { UserDocument } from '../../DB/Models/users.model';

@AuthApply({ roles: [] })
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.WRITE] })
  @Post()
  create(@Body() dto: CreateInventoryDto, @AuthUser() user: UserDocument) {
    return this.inventoryService.create(dto, user);
  }

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

  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.READ] })
  @Get()
  findAll(@Query() query: GetAllInventoryDto) {
    return this.inventoryService.findAll(query);
  }

  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.READ] })
  @Get(':id')
  findOne(@Param() { id }: ParamIdDto) {
    return this.inventoryService.findOne(id);
  }

  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.WRITE] })
  @Patch(':id')
  update(@Param() { id }: ParamIdDto, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.DELETE] })
  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this.inventoryService.remove(id);
  }
}

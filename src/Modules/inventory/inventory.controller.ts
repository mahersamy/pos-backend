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
  FileUpload,
  ParamIdDto,
  Resource,
} from '../../common';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import type { UserDocument } from '../../DB/Models/users.model';

@AuthApply({ roles: [] })
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.WRITE] })
  @FileUpload({ fieldName: 'image' })
  @Post()
  create(
    @Body() dto: CreateInventoryDto,
    @AuthUser() user: UserDocument,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.inventoryService.create(dto, user, image);
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
  @FileUpload({ fieldName: 'image' })
  @Patch(':id')
  update(
    @Param() { id }: ParamIdDto,
    @Body() dto: UpdateInventoryDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.inventoryService.update(id, dto, image);
  }

  @CheckPermissions({ resource: Resource.INVENTORY, actions: [Action.DELETE] })
  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this.inventoryService.remove(id);
  }
}

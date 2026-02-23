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
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { GetAllMenuDto } from './dto/get-all-menu.dto';
import {
  Action,
  AuthUser,
  CheckPermissions,
  ParamIdDto,
  Resource,
  Role,
} from '../../common';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import type { UserDocument } from '../../DB/Models/users.model';

@AuthApply({ roles: [] })
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @CheckPermissions({ resource: Resource.MENU, actions: [Action.WRITE] })
  @Post()
  create(@Body() dto: CreateMenuDto, @AuthUser() user: UserDocument) {
    return this.menuService.create(dto, user);
  }

  @CheckPermissions({ resource: Resource.MENU, actions: [Action.READ] })
  @Get()
  findAll(@Query() query: GetAllMenuDto) {
    return this.menuService.findAll(query);
  }

  @CheckPermissions({ resource: Resource.MENU, actions: [Action.READ] })
  @Get(':id')
  findOne(@Param() { id }: ParamIdDto) {
    return this.menuService.findOne(id);
  }

  @CheckPermissions({ resource: Resource.MENU, actions: [Action.WRITE] })
  @Patch(':id')
  update(@Param() { id }: ParamIdDto, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @CheckPermissions({ resource: Resource.MENU, actions: [Action.DELETE] })
  @Delete(':id')
  remove(@Param() { id }: ParamIdDto) {
    return this.menuService.remove(id);
  }
}

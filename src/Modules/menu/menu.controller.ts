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
} from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/request/create-menu.dto';
import { UpdateMenuDto } from './dto/request/update-menu.dto';
import { GetAllMenuDto } from './dto/request/get-all-menu.dto';
import { MenuResponseDto, PaginatedMenuResponseDto } from './dto/response/menu-response.dto';
import {
  Action,
  AuthUser,
  CheckPermissions,
  ParamIdDto,
  Resource,
  Role,
} from '../../common';
import { AuthApply } from '../../common/Decorators/authApply.decorator';
import type { UserDocument } from '../users/models/users.model';

@ApiTags('Menus')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing JWT token' })
@ApiForbiddenResponse({ description: 'Forbidden - Insufficient permissions' })
@AuthApply({ roles: [] })
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @CheckPermissions({ resource: Resource.MENU, actions: [Action.WRITE] })
  @Post()
  @ApiOperation({ summary: 'Create menu item', description: 'Creates a new menu item.' })
  @ApiCreatedResponse({ type: MenuResponseDto, description: 'Menu item successfully created' })
  create(@Body() dto: CreateMenuDto, @AuthUser() user: UserDocument) {
    return this.menuService.create(dto, user);
  }

  @CheckPermissions({ resource: Resource.MENU, actions: [Action.READ] })
  @Get()
  @ApiOperation({ summary: 'Get all menu items', description: 'Retrieves a list of menu items with filtering, search, and pagination.' })
  @ApiOkResponse({ type: PaginatedMenuResponseDto, description: 'List of menu items' })
  findAll(@Query() query: GetAllMenuDto) {
    return this.menuService.findAll(query);
  }

  @CheckPermissions({ resource: Resource.MENU, actions: [Action.READ] })
  @Get(':id')
  @ApiOperation({ summary: 'Get menu item details by ID', description: 'Retrieves details of a specific menu item.' })
  @ApiOkResponse({ type: MenuResponseDto, description: 'Menu item details' })
  @ApiNotFoundResponse({ description: 'Menu item not found' })
  findOne(@Param() { id }: ParamIdDto) {
    return this.menuService.findOne(id);
  }

  @CheckPermissions({ resource: Resource.MENU, actions: [Action.WRITE] })
  @Patch(':id')
  @ApiOperation({ summary: 'Update menu item', description: 'Updates details of an existing menu item.' })
  @ApiOkResponse({ type: MenuResponseDto, description: 'Menu item successfully updated' })
  @ApiNotFoundResponse({ description: 'Menu item not found' })
  update(@Param() { id }: ParamIdDto, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @CheckPermissions({ resource: Resource.MENU, actions: [Action.DELETE] })
  @Delete(':id')
  @ApiOperation({ summary: 'Delete menu item', description: 'Deletes a menu item from the system.' })
  @ApiOkResponse({ description: 'Menu item successfully deleted' })
  @ApiNotFoundResponse({ description: 'Menu item not found' })
  remove(@Param() { id }: ParamIdDto) {
    return this.menuService.remove(id);
  }
}

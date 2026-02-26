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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetAllOrderDto } from './dto/get-all-order.dto';
import {
  AuthApply,
  AuthUser,
  CheckPermissions,
  Action,
  Resource,
} from 'src/common';
import type { UserDocument } from '../../DB/Models/users.model';

@AuthApply({ roles: [] })
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @CheckPermissions({ resource: Resource.ORDERS, actions: [Action.WRITE] })
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @AuthUser() user: UserDocument,
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @CheckPermissions({ resource: Resource.ORDERS, actions: [Action.READ] })
  @Get()
  findAll(@Query() query: GetAllOrderDto) {
    return this.ordersService.findAll(query);
  }

  @CheckPermissions({ resource: Resource.ORDERS, actions: [Action.READ] })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @CheckPermissions({ resource: Resource.ORDERS, actions: [Action.WRITE] })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

}

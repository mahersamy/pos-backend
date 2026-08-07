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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/request/create-order.dto';
import { UpdateOrderDto } from './dto/request/update-order.dto';
import { GetAllOrderDto } from './dto/request/get-all-order.dto';
import {
  OrderResponseDto,
  PaginatedOrderResponseDto,
} from './dto/response/order-response.dto';
import {
  AuthApply,
  AuthUser,
  CheckPermissions,
  Action,
  Resource,
} from 'src/common';
import type { UserDocument } from '../users/models/users.model';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@AuthApply({ roles: [] })
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Create a new order' })
  @ApiCreatedResponse({ description: 'Order created successfully', type: OrderResponseDto })
  @CheckPermissions({ resource: Resource.ORDERS, actions: [Action.WRITE] })
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @AuthUser() user: UserDocument,
  ) {
    return this.ordersService.create(createOrderDto, user);
  }

  @ApiOperation({ summary: 'Get all orders (paginated)' })
  @ApiOkResponse({ description: 'List of orders retrieved successfully', type: PaginatedOrderResponseDto })
  @CheckPermissions({ resource: Resource.ORDERS, actions: [Action.READ] })
  @Get()
  findAll(@Query() query: GetAllOrderDto) {
    return this.ordersService.findAll(query);
  }

  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiOkResponse({ description: 'Order retrieved successfully', type: OrderResponseDto })
  @CheckPermissions({ resource: Resource.ORDERS, actions: [Action.READ] })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an order by ID' })
  @ApiOkResponse({ description: 'Order updated successfully', type: OrderResponseDto })
  @CheckPermissions({ resource: Resource.ORDERS, actions: [Action.WRITE] })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }
}

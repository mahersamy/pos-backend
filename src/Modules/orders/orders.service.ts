import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { GetAllOrderDto } from './dto/get-all-order.dto';
import { InventoryRepository } from '../../DB/Repository/inventory.repository';
import { InventoryDocument } from '../../DB/Models/inventory.model';
import { UserDocument } from '../../DB/Models/users.model';
import {
  OrderRepository,
  ORDER_QUERY_OPTIONS,
} from '../../DB/Repository/order.repository';
import { OrderItem } from '../../DB/Models/orders.model';
import { OrderStatus, InventoryStock } from '../../common';

@Injectable()
export class OrdersService {
  constructor(
    private readonly inventoryRepo: InventoryRepository,
    private readonly orderRepo: OrderRepository,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: UserDocument) {
    // 1️⃣ Extract IDs
    const inventoryIds = createOrderDto.inventory.map((i) => i.inventoryId);

    // 2️⃣ Fetch only once
    const inventories: InventoryDocument[] = await this.inventoryRepo.find({
      _id: { $in: inventoryIds },
    });

    // 3️⃣ Validate existence
    if (inventories.length !== inventoryIds.length) {
      throw new BadRequestException('Invalid inventory');
    }

    // 4️⃣ Convert to Map for O(1) lookup
    const inventoryMap = new Map(
      inventories.map((inv) => [inv._id.toString(), inv]),
    );

    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    // 5️⃣ Validate stock + calculate correctly
    for (const item of createOrderDto.inventory) {
      const inventory = inventoryMap.get(item.inventoryId.toString());

      if (!inventory) {
        throw new BadRequestException('Invalid inventory');
      }

      if (inventory.quantity < item.quantity) {
        throw new BadRequestException(`Not enough stock for ${inventory.name}`);
      }

      // ✅ correct total calculation
      totalAmount += inventory.price * item.quantity;

      // ✅ build proper order item snapshot
      orderItems.push({
        inventory: inventory._id,
        quantity: item.quantity,
      });

      // 6️⃣ Decrement stock & Update stock status (IMPORTANT)
      const newQuantity = inventory.quantity - item.quantity;
      const stockStatus =
        newQuantity === 0 ? InventoryStock.OUTOFSTOCK : inventory.stock;

      await this.inventoryRepo.findOneAndUpdate(
        { _id: inventory._id },
        {
          $inc: { quantity: -item.quantity },
          $set: { stock: stockStatus },
        },
      );
    }

    // Generate order number safely based on existing counts
    const orderCount = await this.orderRepo.count({});
    const orderNumber = `#${(orderCount + 1).toString().padStart(3, '0')}`;

    // 7️⃣ Create order
    return this.orderRepo.createAndReturn({
      orderNumber,
      orderItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      orderType: createOrderDto.orderType,
      table: createOrderDto.table,
      guestName: createOrderDto.guestName,
      deliveryInfo: createOrderDto.deliveryInfo,
      phoneNumber: createOrderDto.phoneNumber,
      createdBy: user._id,
    });
  }

  async findAll(query: GetAllOrderDto) {
    const { page, limit, sort, search, status, orderType } = query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (orderType) {
      filter.orderType = orderType;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
      ];
    }

    return this.orderRepo.paginate(filter, {
      page,
      limit,
      sort: sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 },
      ...ORDER_QUERY_OPTIONS,
    });
  }

  findOne(id: string) {
    return this.orderRepo.findById(id, {}, ORDER_QUERY_OPTIONS);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const existingOrder = await this.orderRepo.findById(id);
    if (!existingOrder) {
      throw new BadRequestException('Order not found');
    }

    if (
      updateOrderDto.status === OrderStatus.CANCELLED &&
      existingOrder.status !== OrderStatus.CANCELLED
    ) {
      if (!updateOrderDto.cancellationReason) {
        throw new BadRequestException(
          'cancellationReason is required when cancelling an order',
        );
      }
      // Restock inventory items when an order is cancelled
      for (const item of existingOrder.orderItems) {
        await this.inventoryRepo.findOneAndUpdate(
          { _id: item.inventory },
          {
            $inc: { quantity: item.quantity },
            $set: { stock: InventoryStock.INSTOCK },
          },
        );
      }
    }

    return this.orderRepo.findByIdAndUpdate(
      id,
      updateOrderDto,
      ORDER_QUERY_OPTIONS,
    );
  }
}

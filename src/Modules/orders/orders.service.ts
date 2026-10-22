import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { CreateOrderDto } from './dto/request/create-order.dto';
import { UpdateOrderDto } from './dto/request/update-order.dto';
import { GetAllOrderDto } from './dto/request/get-all-order.dto';
import { InventoryRepository } from '../inventory/repository/inventory.repository';
import {
  InventoryMovementReferenceType,
  InventoryMovementType,
} from '../inventory/model/inventory-movement.model';
import { InventoryMovementRepository } from '../inventory/repository/inventory-movement.repository';
import { UserDocument } from '../users/models/users.model';
import { OrderRepository } from './repository/order.repository';
import { CounterRepository } from './repository/counter.repository';
import { ORDER_QUERY_OPTIONS } from './constants/orders.constants';
import { OrderItem } from './model/orders.model';
import { OrderStatus } from '../../common';

@Injectable()
export class OrdersService {
  constructor(
    private readonly inventoryRepo: InventoryRepository,
    private readonly inventoryMovementRepo: InventoryMovementRepository,
    private readonly orderRepo: OrderRepository,
    private readonly counterRepo: CounterRepository,

    @InjectConnection()
    private readonly connection: Connection,
  ) { }

  async create(createOrderDto: CreateOrderDto, user: UserDocument) {
    // ── 1. Aggregate duplicate inventoryIds before touching the DB ──────────
    const quantities = new Map<string, number>();
    for (const item of createOrderDto.inventory) {
      const key = item.inventoryId.toString();
      quantities.set(key, (quantities.get(key) ?? 0) + item.quantity);
    }

    const uniqueIds = [...quantities.keys()].map((id) => new Types.ObjectId(id));

    // ── 2. Pre-fetch inventory for price snapshot & existence check ──────────
    const inventories = await this.inventoryRepo.find({ _id: { $in: uniqueIds } });

    if (inventories.length !== uniqueIds.length) {
      throw new BadRequestException('One or more inventory items not found');
    }

    const inventoryMap = new Map(inventories.map((inv) => [inv._id.toString(), inv]));

    // Pre-calculate orderItems & total (using price snapshot at request time)
    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const [idStr, qty] of quantities) {
      const inventory = inventoryMap.get(idStr)!;
      const lineTotal = parseFloat((inventory.price * qty).toFixed(2));
      totalAmount += lineTotal;
      orderItems.push({
        inventory: inventory._id,
        name: inventory.name,
        unitPrice: inventory.price,
        quantity: qty,
        lineTotal,
      });
    }

    // ── 3. Open MongoDB transaction ──────────────────────────────────────────
    const session = await this.connection.startSession();
    let order: any;

    try {
      await session.withTransaction(async () => {
        // ── 3a. Atomic stock decrement for every item ────────────────────────
        const decrementedItems: { inventory: Types.ObjectId; quantity: number; quantityBefore: number; quantityAfter: number }[] = [];

        for (const item of orderItems) {
          const updated = await this.inventoryRepo.decrementStock(
            item.inventory as Types.ObjectId,
            item.quantity,
            session,
          );

          if (!updated) {
            const name = inventoryMap.get(item.inventory.toString())?.name ?? item.inventory.toString();
            throw new BadRequestException(`Not enough stock for "${name}"`);
          }

          decrementedItems.push({
            inventory: item.inventory as Types.ObjectId,
            quantity: item.quantity,
            quantityBefore: updated.quantity + item.quantity,
            quantityAfter: updated.quantity,
          });
        }

        // ── 3b. Atomic counter → collision-free order number ─────────────────
        const sequence = await this.counterRepo.nextSequence('orders', session);
        const orderNumber = `#${sequence.toString().padStart(3, '0')}`;

        // ── 3c. Create order document ────────────────────────────────────────
        order = await this.orderRepo.createAndReturn(
          {
            orderNumber,
            orderItems,
            totalAmount: parseFloat(totalAmount.toFixed(2)),
            orderType: createOrderDto.orderType,
            table: createOrderDto.table,
            guestName: createOrderDto.guestName,
            deliveryInfo: createOrderDto.deliveryInfo,
            phoneNumber: createOrderDto.phoneNumber,
            createdBy: user._id,
          },
          session,
        );

        // ── 3d. Record stock movement ledger entries for every item ──────────
        for (const dec of decrementedItems) {
          await this.inventoryMovementRepo.recordMovement(
            {
              inventory: dec.inventory,
              type: InventoryMovementType.SALE,
              quantityDelta: -dec.quantity,
              quantityBefore: dec.quantityBefore,
              quantityAfter: dec.quantityAfter,
              referenceType: InventoryMovementReferenceType.ORDER,
              referenceId: order._id,
              actorId: user._id,
              reason: `Sale on order ${orderNumber}`,
            },
            session,
          );
        }
      });
    } finally {
      await session.endSession();
    }

    return order;
  }

  async findAll(query: GetAllOrderDto) {
    const { page, limit, sort, search, status, orderType } = query;

    const filter: any = {};

    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;
    if (search) {
      filter.$or = [
        { orderNumber: search },
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

  async findOne(id: string) {
    return this.orderRepo.findById(id, {}, ORDER_QUERY_OPTIONS);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    // ── Cancellation: requires transaction to prevent double-restock ─────────
    if (updateOrderDto.status === OrderStatus.CANCELLED) {
      if (!updateOrderDto.cancellationReason) {
        throw new BadRequestException(
          'cancellationReason is required when cancelling an order',
        );
      }
      return this.cancelOrder(id, updateOrderDto.cancellationReason);
    }

    // ── Non-cancellation update (status change, etc.) ────────────────────────
    const existing = await this.orderRepo.findById(id);
    if (!existing) throw new BadRequestException('Order not found');

    return this.orderRepo.findByIdAndUpdate(id, updateOrderDto, ORDER_QUERY_OPTIONS);
  }

  // ── Private: atomic cancellation in a transaction ─────────────────────────
  private async cancelOrder(id: string, cancellationReason: string) {
    const session = await this.connection.startSession();
    let cancelledOrder: any;

    try {
      await session.withTransaction(async () => {
        // Conditional atomic transition: IN_PROCESS/READY → CANCELLED
        // If the order is already cancelled this returns null → no double-restock
        cancelledOrder = await this.orderRepo.findOneAndUpdate(
          {
            _id: new Types.ObjectId(id),
            status: { $ne: OrderStatus.CANCELLED }, // ← guard
          },
          { $set: { status: OrderStatus.CANCELLED, cancellationReason } },
          { session, ...ORDER_QUERY_OPTIONS },
        );

        if (!cancelledOrder) {
          // Either doesn't exist or was already cancelled — abort without restocking
          throw new ConflictException('Order is already cancelled or does not exist');
        }

        // Restock every item — inside the same transaction
        for (const item of cancelledOrder.orderItems) {
          const updated = await this.inventoryRepo.incrementStock(
            item.inventory as Types.ObjectId,
            item.quantity,
            session,
          );

          if (updated) {
            await this.inventoryMovementRepo.recordMovement(
              {
                inventory: item.inventory as Types.ObjectId,
                type: InventoryMovementType.SALE_REVERSAL,
                quantityDelta: item.quantity,
                quantityBefore: updated.quantity - item.quantity,
                quantityAfter: updated.quantity,
                referenceType: InventoryMovementReferenceType.ORDER,
                referenceId: cancelledOrder._id,
                reason: cancellationReason,
              },
              session,
            );
          }
        }
      });
    } finally {
      await session.endSession();
    }

    return cancelledOrder;
  }
}

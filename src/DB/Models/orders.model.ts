import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;
export type OrderItemDocument = HydratedDocument<OrderItem>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Inventory', required: true })
  inventory: Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: [OrderItemSchema], required: true })
  orderItems: OrderItem[];

  @Prop({ type: String, required: true })
  orderNumber: string;

  @Prop({
    type: String,
    enum: ['in_process', 'completed', 'cancelled', 'ready'],
    default: 'in_process',
  })
  status: string;

  @Prop({ type: String })
  cancellationReason: string;

  @Prop({
    type: String,
    enum: ['dine_in', 'delivery'],
    required: true,
  })
  orderType: string;

  @Prop({ type: String })
  table: string;

  @Prop({ type: String })
  guestName: string;

  @Prop({ type: String })
  deliveryInfo: string;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: Number, required: true, default: 0 })
  totalAmount: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ createdBy: 1 });

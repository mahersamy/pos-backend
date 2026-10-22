import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import {
  InventoryMovementReferenceType,
  InventoryMovementType,
} from '../enums/inventory-movement.enum';

export type InventoryMovementDocument = HydratedDocument<InventoryMovement>;
export { InventoryMovementReferenceType, InventoryMovementType };

@Schema({ timestamps: true })
export class InventoryMovement {
  @Prop({ type: Types.ObjectId, ref: 'Inventory', required: true, index: true })
  inventory: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(InventoryMovementType),
    required: true,
  })
  type: InventoryMovementType;

  /**
   * Signed quantity change: positive adds stock, negative removes stock.
   */
  @Prop({ type: Number, required: true })
  quantityDelta: number;

  @Prop({ type: Number, required: true, min: 0 })
  quantityBefore: number;

  @Prop({ type: Number, required: true, min: 0 })
  quantityAfter: number;

  @Prop({
    type: String,
    enum: Object.values(InventoryMovementReferenceType),
    required: false,
  })
  referenceType?: InventoryMovementReferenceType;

  @Prop({ type: Types.ObjectId, required: false })
  referenceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  actorId?: Types.ObjectId;

  @Prop({ type: String, required: false })
  reason?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);

// Query by item movements in chronological reverse
InventoryMovementSchema.index({ inventory: 1, createdAt: -1 });

// Query global movements by date range
InventoryMovementSchema.index({ createdAt: -1 });

// Query by movement type and date
InventoryMovementSchema.index({ type: 1, createdAt: -1 });

// Query by reference document (e.g. find all movements for an order)
InventoryMovementSchema.index({ referenceId: 1 });

// Idempotency protection: prevent duplicate movement on order/reference retries
InventoryMovementSchema.index(
  { referenceId: 1, referenceType: 1, inventory: 1, type: 1 },
  { unique: true, sparse: true },
);

import { Types } from 'mongoose';
import {
  InventoryMovementReferenceType,
  InventoryMovementType,
} from '../enums/inventory-movement.enum';

export interface IInventoryMovement {
  inventory: Types.ObjectId;
  type: InventoryMovementType;
  quantityDelta: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType?: InventoryMovementReferenceType;
  referenceId?: Types.ObjectId;
  actorId?: Types.ObjectId;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

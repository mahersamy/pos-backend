import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InventoryDocument = HydratedDocument<Inventory>;

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0 })
  quantity: number;

  @Prop({ type: String, enum: ['instock', 'outofstock'], default: 'instock' })
  stock: string;

  @Prop({
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active',
  })
  status: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Boolean, required: true, default: false })
  perishable: boolean;

  @Prop({ _id: false, type: { public_id: String, secure_url: String } })
  image: { public_id: string; secure_url: string };

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

// Useful indexes for querying
InventorySchema.index({ name: 1 });
InventorySchema.index({ category: 1 });
InventorySchema.index({ status: 1 });

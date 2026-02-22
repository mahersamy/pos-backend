import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MenuDocument = HydratedDocument<Menu>;

@Schema({ timestamps: true })
export class Menu {
  @Prop({ type: String, required: true, trim: true, lowercase: true })
  name: string;

  @Prop({ type: String, trim: true })
  description: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const MenuSchema = SchemaFactory.createForClass(Menu);
MenuSchema.index({ name: 1 }, { unique: true });

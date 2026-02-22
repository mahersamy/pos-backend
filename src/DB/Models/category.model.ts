import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  @Prop({ type: String, required: true, trim: true, lowercase: true })
  name: string;

  @Prop({ type: String, trim: true })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Menu', required: true })
  menu: Types.ObjectId;

  @Prop({ _id: false, type: { public_id: String, secure_url: String } })
  image: { public_id: string; secure_url: string };

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ name: 1, menu: 1 }, { unique: true });

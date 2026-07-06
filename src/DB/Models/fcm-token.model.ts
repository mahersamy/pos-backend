import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FcmTokenDocument = HydratedDocument<FcmToken>;

@Schema({ timestamps: true })
export class FcmToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  // TTL index: 60 days (60d)
  // Mongoose handles updatedAt automatically due to timestamps: true.
  @Prop({ type: Date, expires: '60d', default: Date.now })
  updatedAt?: Date;
}

export const FcmTokenSchema = SchemaFactory.createForClass(FcmToken);

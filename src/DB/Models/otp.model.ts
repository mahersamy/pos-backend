import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OtpType } from 'src/common';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true, virtuals: true, toJSON: { virtuals: true } })
export class Otp {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: String, enum: OtpType, required: true })
  type: OtpType;

  plainCode?: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

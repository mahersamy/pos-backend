import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReservationDocument = HydratedDocument<Reservation>;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: String, required: true, trim: true })
  tableNumber: string;

  @Prop({ type: Number, required: true })
  paxNumber: number;

  @Prop({ type: Date, required: true })
  reservationDate: Date;

  @Prop({ type: String, required: true, trim: true })
  reservationTime: string;

  @Prop({ type: Number, required: true })
  depositFee: number;

  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: String, enum: ['Mr', 'Ms'], required: true })
  title: string;

  @Prop({ type: String, required: true, trim: true })
  firstName: string;

  @Prop({ type: String, required: true, trim: true })
  lastName: string;

  @Prop({ type: String, required: true, trim: true })
  phoneNumber: string;

  @Prop({ type: String, trim: true, lowercase: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);


ReservationSchema.index({ reservationDate: 1 });

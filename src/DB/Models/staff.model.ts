import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StaffDocument = HydratedDocument<Staff>;

@Schema({ timestamps: true, virtuals: true, toJSON: { virtuals: true } })
export class Staff {
  @Prop({ required: true, trim: true, lowercase: true })
  fullname: string;

  @Prop({ required: [true, 'Email is required'], unique: true })
  email: string;

  @Prop({ type: String, required: true })
  position: string;

  @Prop({ type: Number, min: [18, 'Age must be at least 18'], required: true })
  age: number;

  @Prop({ type: String, required: true, maxLength: 15, minLength: 15 })
  phoneNumber: string;

  @Prop({ type: String })
  address: string;

  @Prop({ _id: false, type: { public_id: String, secure_url: String } })
  profilePicture: { public_id: string; secure_url: string };

  @Prop({ type: Number, required: true })
  salary: number;

  @Prop({ type: Date, required: true })
  DateOfBirth: Date;

  @Prop({ type: String, required: true })
  startShiftTiming: string;

  @Prop({ type: String, required: true })
  endShiftTiming: string;

  @Prop({ type: String })
  details: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);

// indexs
StaffSchema.index({ email: 1, phoneNumber: 1 });

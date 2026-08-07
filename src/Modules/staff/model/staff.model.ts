import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type StaffDocument = HydratedDocument<Staff>;

@Schema({ timestamps: true, virtuals: true, toJSON: { virtuals: true } })
export class Staff {
  @Prop({ required: true, trim: true, lowercase: true })
  fullname: string;

  @Prop({ required: [true, "Email is required"], unique: true })
  email: string;

  @Prop({ type: String, required: true })
  position: string;

  @Prop({ type: String, required: true, maxLength: 11, minLength: 11 })
  phoneNumber: string;

  @Prop({ type: String })
  address: string;

  @Prop({ _id: false, type: { public_id: String, secure_url: String } })
  profilePicture: { public_id: string; secure_url: string };

  @Prop({ type: Number, required: true })
  salary: number;

  @Prop({ type: Date, required: true })
  dateOfBirth: Date;

  @Prop({ type: String, required: true })
  startShiftTiming: string;

  @Prop({ type: String, required: true })
  endShiftTiming: string;

  @Prop({ type: String })
  details: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  createdBy: Types.ObjectId;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);

StaffSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return undefined;
  const today = new Date();
  let age = today.getFullYear() - this.dateOfBirth.getFullYear();
  const m = today.getMonth() - this.dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < this.dateOfBirth.getDate())) {
    age--;
  }
  return age;
});

StaffSchema.index({ createdAt: -1 });

StaffSchema.index({
    email: 1,
    createdAt: -1
});

StaffSchema.index({
    phoneNumber: 1,
    createdAt: -1
});





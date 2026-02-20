import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../common/Enums/role.enum';
import { OtpDocument } from './otp.model';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, virtuals: true, toJSON: { virtuals: true } })
export class User {
  @Prop({ required: true, trim: true, lowercase: true })
  firstName: string;

  @Prop({ required: true, trim: true, lowercase: true })
  lastName: string;

  @Prop({ required: [true, 'Email is required'], unique: true })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ type: String, enum: Role, default: Role.USER, required: true })
  role: Role;

  @Prop({ type: Number, min: [14, 'Age must be at least 14'], required: true })
  age: number;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  profilePicture: string;

  @Prop({ type: Boolean })
  isActive: boolean;

  @Virtual()
  otp: OtpDocument[];

  @Virtual({
    get: function () {
      return `${this.firstName} ${this.lastName}`;
    },
  })
  fullName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.virtual('otp', {
//   ref: 'Otp',
//   localField: '_id',
//   foreignField: 'createdBy',
// });

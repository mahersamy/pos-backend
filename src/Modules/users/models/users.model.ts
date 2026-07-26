import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { Role } from '../../../common/Enums/role.enum';
import { UserStatus } from '../enums/user-status.enum';
import { Action } from '../../../common/Enums/actions-permisson.enum';
import { Resource } from '../../../common/Enums/resource-permisson.enum';

export type UserDocument = HydratedDocument<User>;

/** Map of resource → action → boolean, e.g. { staff: { read: true, write: false, delete: false } } */
export type PermissionsMap = Partial<Record<Resource, Record<Action, boolean>>>;

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

  @Prop({ type: Object, default: {} })
  permissions: PermissionsMap;

  @Prop({ type: Number, min: [14, 'Age must be at least 14'], required: true })
  age: number;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  profilePicture: string;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  active: UserStatus;



  @Virtual({
    get: function () {
      return `${this.firstName} ${this.lastName}`;
    },
  })
  fullName: string;

}

export const UserSchema = SchemaFactory.createForClass(User);

// Default list
UserSchema.index({
    createdAt: -1
});

// Role filter
UserSchema.index({
    role: 1,
    createdAt: -1
});

// // Status filter
// UserSchema.index({
//     active: 1,
//     createdAt: -1
// });

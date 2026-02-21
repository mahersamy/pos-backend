import { Expose } from "class-transformer";
import { Action, Resource, Role } from "src/common";

export class UserProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  role: Role;

  @Expose()
  permissions: { resource: Resource; actions: Action[] }[];
}
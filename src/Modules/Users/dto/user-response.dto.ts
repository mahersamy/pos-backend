import { Expose } from "class-transformer";

export class UserProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;
}
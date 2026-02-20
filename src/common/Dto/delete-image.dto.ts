import { IsNotEmpty } from "class-validator";
import { Types } from "mongoose";

export class DeleteProductImageDto {
    @IsNotEmpty()
    imageId: Types.ObjectId;
}
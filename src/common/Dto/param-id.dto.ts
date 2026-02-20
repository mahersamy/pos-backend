import { IsMongoId, IsString } from "class-validator";

export class ParamIdDto {
    @IsString()
    @IsMongoId()
    id: string;
}
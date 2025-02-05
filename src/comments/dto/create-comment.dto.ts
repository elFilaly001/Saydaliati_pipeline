import { IsNotEmpty, IsString, IsNumber, IsDate } from "class-validator";

export class CreateCommentDto {

    @IsNotEmpty()
    @IsString()
    pharmacyId: string;

    @IsNotEmpty()
    @IsNumber()
    stars?: number;

    @IsNotEmpty()
    @IsString()
    comment: string;

    @IsNotEmpty()
    @IsDate()
    createdAt:Date ;
}

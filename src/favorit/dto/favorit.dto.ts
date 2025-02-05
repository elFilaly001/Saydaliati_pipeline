import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class FavoritDto {
    @IsArray()
    @IsOptional()
    favorites: string[]; 
}   
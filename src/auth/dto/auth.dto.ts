import { IsString } from "class-validator";


export class LoginDto {
    @IsString()
    email: string;

    @IsString()
    password: string;
}

export class RegisterDto extends LoginDto {
    @IsString()
    name: string;
}
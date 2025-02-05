import { IsString, IsOptional, IsUrl, IsBoolean, IsPhoneNumber, IsNotEmpty, Matches,IsEnum } from "class-validator";

export enum PharmacyStatus {
  OPEN = 'open',
  CLOSE = 'close',
}


export class CreatePharmacyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  latitude: string;

  @IsString()
  @IsNotEmpty()
  longLatitude: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, {
    message: 'openHours must be in HH:mm format',
  })
  openHours: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/, {
    message: 'closeHours must be in HH:mm format',
  })
  closeHours: string;

  @IsPhoneNumber(null)
  @IsNotEmpty()
  telephone: string;

  @IsEnum(PharmacyStatus, {
    message: 'status must be either "open" or "close"',
  })
  @IsNotEmpty()
  status: PharmacyStatus;
}

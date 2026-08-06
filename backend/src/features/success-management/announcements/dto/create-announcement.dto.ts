import { IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator";

export class CreateAnnouncementDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  targetType?: string; // "ALL" | "SERVICE" | "USER"

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;
}

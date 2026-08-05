import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Password@123" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: "Rahul Sharma" })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: "9876543210", required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: "Bhopal, MP", required: false })
  @IsString()
  @IsOptional()
  address?: string;
}

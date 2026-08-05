import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({ description: "The reset token received in the email" })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: "NewSecurePassword123!", minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  password: string;
}

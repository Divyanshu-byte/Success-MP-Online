import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class CreateApplicationDto {
  @ApiProperty({ example: "pan_card" })
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @ApiProperty({ example: { fullName: "Rahul Sharma", phone: "9876543210" } })
  @IsObject()
  formData: Record<string, any>;
}

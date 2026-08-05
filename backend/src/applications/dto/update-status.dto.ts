import { ApiProperty } from "@nestjs/swagger";
import { ApplicationStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateStatusDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiProperty({ example: "Documents verified successfully", required: false })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}

import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChatMessageDto {
  @ApiProperty({ example: "user", enum: ["user", "assistant", "system"] })
  @IsString()
  @IsNotEmpty()
  role: "user" | "assistant" | "system";

  @ApiProperty({ example: "What is the status of my application SUC-12345?" })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ example: "Check status of application SUC-12345" })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ type: [ChatMessageDto], required: false })
  @IsArray()
  @IsOptional()
  history?: ChatMessageDto[];
}

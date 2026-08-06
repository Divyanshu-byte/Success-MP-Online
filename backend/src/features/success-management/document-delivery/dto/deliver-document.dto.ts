import { IsOptional, IsBoolean } from "class-validator";
import { Transform } from "class-transformer";

export class DeliverDocumentDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true)
  overwrite?: boolean;
}

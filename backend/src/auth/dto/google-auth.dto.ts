import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

/**
 * Used when the frontend exchanges a Google ID token for a NestJS JWT.
 * This is the token-based flow (e.g. for mobile apps or SPA direct exchange).
 * The standard browser OAuth flow uses GET /auth/google → redirect → callback.
 */
export class GoogleAuthDto {
  @ApiProperty({ description: "Google ID token from Google Sign-In (credential)" })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

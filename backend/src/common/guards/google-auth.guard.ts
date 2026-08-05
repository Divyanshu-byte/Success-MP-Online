import {
  Injectable,
  ExecutionContext,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  constructor(private configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const clientID = this.configService.get<string>("GOOGLE_CLIENT_ID")?.trim();
    const clientSecret = this.configService.get<string>("GOOGLE_CLIENT_SECRET")?.trim();

    if (!clientID || !clientSecret || clientID === "not_configured") {
      throw new BadRequestException(
        "Google Sign-In is not configured on this server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env.",
      );
    }

    return super.canActivate(context);
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

/**
 * Lightweight in-memory rate-limit guard.
 * Uses no external packages — only Node's built-in Map.
 *
 * Default: 3 requests per 60 seconds per IP address.
 * Apply with @UseGuards(RateLimitGuard) on individual endpoints.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  /** max requests allowed within the window */
  private readonly limit = 3;
  /** window size in milliseconds */
  private readonly windowMs = 60_000;
  /** IP → array of request timestamps */
  private readonly store = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip: string =
      request.ip ||
      request.headers["x-forwarded-for"] ||
      request.connection?.remoteAddress ||
      "unknown";

    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing timestamps for this IP, filter out old ones
    const timestamps = (this.store.get(ip) ?? []).filter(
      (ts) => ts > windowStart,
    );

    if (timestamps.length >= this.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message:
            "Too many password reset requests. Please wait 60 seconds before trying again.",
          error: "Too Many Requests",
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Record this request
    timestamps.push(now);
    this.store.set(ip, timestamps);

    // Periodically clean up stale entries to avoid memory growth
    if (this.store.size > 10_000) {
      for (const [key, ts] of this.store.entries()) {
        if (ts.every((t) => t <= windowStart)) {
          this.store.delete(key);
        }
      }
    }

    return true;
  }
}

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    // Silence missing favicon.ico 404 noise from browsers
    if (request.url.includes("favicon.ico") && status === HttpStatus.NOT_FOUND) {
      return response.status(HttpStatus.NO_CONTENT).end();
    }

    const errDetail = exception instanceof Error ? exception.stack : String(exception);
    this.logger.error(
      `HTTP Status ${status} Error: ${JSON.stringify(message)} Path: ${request.url}${
        status >= 500 ? `\nStack: ${errDetail}` : ""
      }`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        typeof message === "object" && message !== null
          ? (message as any).message || message
          : message,
    });
  }
}

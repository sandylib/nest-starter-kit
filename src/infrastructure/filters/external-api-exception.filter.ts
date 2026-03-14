import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import {
  ExternalApiHttpError,
  ExternalApiUnavailableError,
} from "../../shared/errors/external-api.errors";

@Catch(ExternalApiHttpError, ExternalApiUnavailableError)
export class ExternalApiExceptionFilter implements ExceptionFilter {
  catch(
    exception: ExternalApiHttpError | ExternalApiUnavailableError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.SERVICE_UNAVAILABLE;
    let message = "External service unavailable";
    let error = "Service Unavailable";

    if (exception instanceof ExternalApiHttpError) {
      status = HttpStatus.BAD_GATEWAY;
      message = exception.message;
      error = "Bad Gateway";
    } else if (exception instanceof ExternalApiUnavailableError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = exception.message;
      error = "Service Unavailable";
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}

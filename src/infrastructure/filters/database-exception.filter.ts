import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { Prisma } from "@prisma/client";
import {
  DatabaseConnectionError,
  DatabaseConstraintError,
  DatabaseNotFoundError,
  DatabaseOperationError,
  DatabaseValidationError,
} from "../../shared/errors/database.errors";
import { PRISMA_ERROR_CODES } from "../../shared/constants/errors/database-errors.constants";

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
  DatabaseConnectionError,
  DatabaseConstraintError,
  DatabaseNotFoundError,
  DatabaseOperationError,
  DatabaseValidationError,
)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "Database Error";

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaCode = exception.code;

      if (
        prismaCode === PRISMA_ERROR_CODES.CONNECTION_ERROR ||
        prismaCode === PRISMA_ERROR_CODES.CONNECTION_TIMEOUT ||
        prismaCode === PRISMA_ERROR_CODES.DATABASE_NOT_FOUND ||
        prismaCode === PRISMA_ERROR_CODES.ACCESS_DENIED ||
        prismaCode === PRISMA_ERROR_CODES.TLS_CONNECTION_ERROR
      ) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = "Database connection failed";
        error = "Service Unavailable";
      } else if (
        prismaCode === PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT_VIOLATION
      ) {
        status = HttpStatus.CONFLICT;
        message = "Duplicate record - resource already exists";
        error = "Conflict";
      } else if (
        prismaCode === PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT_VIOLATION
      ) {
        status = HttpStatus.CONFLICT;
        message = "Foreign key constraint violation";
        error = "Conflict";
      } else if (prismaCode === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
        status = HttpStatus.NOT_FOUND;
        message = "Resource not found";
        error = "Not Found";
      } else if (
        prismaCode === PRISMA_ERROR_CODES.INVALID_VALUE_TYPE ||
        prismaCode === PRISMA_ERROR_CODES.TYPE_MISMATCH ||
        prismaCode === PRISMA_ERROR_CODES.NULL_CONSTRAINT_VIOLATION ||
        prismaCode === PRISMA_ERROR_CODES.MISSING_REQUIRED_VALUE ||
        prismaCode === PRISMA_ERROR_CODES.MISSING_REQUIRED_ARGUMENT
      ) {
        status = HttpStatus.BAD_REQUEST;
        message = "Invalid data - validation error";
        error = "Bad Request";
      } else if (prismaCode === PRISMA_ERROR_CODES.TRANSACTION_TIMEOUT) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = "Database transaction timeout";
        error = "Service Unavailable";
      } else if (prismaCode === PRISMA_ERROR_CODES.TRANSACTION_CONFLICT) {
        status = HttpStatus.CONFLICT;
        message = "Database transaction conflict";
        error = "Conflict";
      } else if (prismaCode === PRISMA_ERROR_CODES.CONSTRAINT_VIOLATION) {
        status = HttpStatus.CONFLICT;
        message = "Database constraint violation";
        error = "Conflict";
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = "Database operation failed";
        error = "Internal Server Error";
      }
    } else if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = "An unknown database error occurred";
      error = "Internal Server Error";
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = "Invalid query parameters";
      error = "Bad Request";
    } else if (exception instanceof DatabaseConnectionError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = exception.message;
      error = "Service Unavailable";
    } else if (exception instanceof DatabaseConstraintError) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
      error = "Conflict";
    } else if (exception instanceof DatabaseNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
      error = "Not Found";
    } else if (exception instanceof DatabaseValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = "Bad Request";
    } else if (exception instanceof DatabaseOperationError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      error = "Internal Server Error";
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
    });
  }
}

import { HttpException, HttpStatus } from "@nestjs/common";

export class DatabaseError extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    public readonly source: string,
    public readonly operation?: string,
    public readonly originalError?: Error,
    public readonly context?: Record<string, any>,
  ) {
    super(message, statusCode);
    this.name = this.constructor.name;
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(source: string, operation?: string, originalError?: Error) {
    super(
      "Database connection failed. Please try again later.",
      HttpStatus.SERVICE_UNAVAILABLE,
      source,
      operation,
      originalError,
      { errorType: "connection" },
    );
  }
}

export class DatabaseConstraintError extends DatabaseError {
  constructor(
    message: string,
    source: string,
    operation?: string,
    originalError?: Error,
    context?: Record<string, any>,
  ) {
    super(message, HttpStatus.CONFLICT, source, operation, originalError, {
      errorType: "constraint",
      ...context,
    });
  }
}

export class DatabaseNotFoundError extends DatabaseError {
  constructor(
    resource: string,
    source: string,
    operation?: string,
    originalError?: Error,
  ) {
    super(
      `${resource} not found`,
      HttpStatus.NOT_FOUND,
      source,
      operation,
      originalError,
      { errorType: "not_found", resource },
    );
  }
}

export class DatabaseOperationError extends DatabaseError {
  constructor(
    message: string,
    source: string,
    operation?: string,
    originalError?: Error,
    context?: Record<string, any>,
  ) {
    super(
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
      source,
      operation,
      originalError,
      { errorType: "operation", ...context },
    );
  }
}

export class DatabaseValidationError extends DatabaseError {
  constructor(
    message: string,
    source: string,
    operation?: string,
    originalError?: Error,
    context?: Record<string, any>,
  ) {
    super(message, HttpStatus.BAD_REQUEST, source, operation, originalError, {
      errorType: "validation",
      ...context,
    });
  }
}

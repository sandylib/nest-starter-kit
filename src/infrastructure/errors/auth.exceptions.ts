import { HttpException, HttpStatus } from "@nestjs/common";
import { AUTH_ERROR_MESSAGES } from "../../shared/constants/errors/auth-errors.constants";

export class AuthenticationError extends HttpException {
  constructor(message: string = AUTH_ERROR_MESSAGES.INVALID_TOKEN) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class AuthorizationError extends HttpException {
  constructor(message: string = AUTH_ERROR_MESSAGES.ACCESS_DENIED) {
    super(message, HttpStatus.FORBIDDEN);
  }
}

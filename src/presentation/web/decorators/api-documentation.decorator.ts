import { applyDecorators } from "@nestjs/common";
import { ApiResponse, ApiResponseOptions } from "@nestjs/swagger";
import {
  HTTP_STATUS,
  HTTP_RESPONSE_DESCRIPTIONS,
} from "../../../shared/constants/http.constants";

const DEFAULT_ERROR_RESPONSES = [
  ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: HTTP_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  }),
  ApiResponse({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    description: HTTP_RESPONSE_DESCRIPTIONS.INTERNAL_ERROR,
  }),
  ApiResponse({
    status: HTTP_STATUS.BAD_GATEWAY,
    description: HTTP_RESPONSE_DESCRIPTIONS.BAD_GATEWAY,
  }),
  ApiResponse({
    status: HTTP_STATUS.SERVICE_UNAVAILABLE,
    description: HTTP_RESPONSE_DESCRIPTIONS.SERVICE_UNAVAILABLE,
  }),
  ApiResponse({
    status: HTTP_STATUS.NO_CONTENT,
    description: HTTP_RESPONSE_DESCRIPTIONS.NO_CONTENT,
  }),
];

const DATABASE_ERROR_RESPONSES = [
  ApiResponse({
    status: HTTP_STATUS.UNAUTHORIZED,
    description: HTTP_RESPONSE_DESCRIPTIONS.UNAUTHORIZED,
  }),
  ApiResponse({
    status: HTTP_STATUS.BAD_REQUEST,
    description: "Invalid request data or validation error",
  }),
  ApiResponse({
    status: HTTP_STATUS.NOT_FOUND,
    description: "Resource not found",
  }),
  ApiResponse({
    status: HTTP_STATUS.CONFLICT,
    description: "Database constraint violation or duplicate record",
  }),
  ApiResponse({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    description: HTTP_RESPONSE_DESCRIPTIONS.INTERNAL_ERROR,
  }),
  ApiResponse({
    status: HTTP_STATUS.SERVICE_UNAVAILABLE,
    description: "Database connection failed",
  }),
];

export function ApiDocumentation(options?: {
  responses?: ApiResponseOptions[];
}): ReturnType<typeof applyDecorators> {
  const decorators = [];

  if (options?.responses) {
    options.responses.forEach((response) => {
      decorators.push(ApiResponse(response));
    });
  }

  decorators.push(...DEFAULT_ERROR_RESPONSES);

  return applyDecorators(...decorators);
}

export function ApiDatabaseDocumentation(options?: {
  responses?: ApiResponseOptions[];
}): ReturnType<typeof applyDecorators> {
  const decorators = [];

  if (options?.responses) {
    options.responses.forEach((response) => {
      decorators.push(ApiResponse(response));
    });
  }

  decorators.push(...DATABASE_ERROR_RESPONSES);

  return applyDecorators(...decorators);
}

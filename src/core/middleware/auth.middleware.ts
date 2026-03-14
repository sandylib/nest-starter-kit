import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { JwtTokenPayload } from "../../shared/types/jwt-token.interface";
import { AUTH_ERROR_MESSAGES } from "../../shared/constants/errors/auth-errors.constants";

declare global {
  namespace Express {
    interface Request {
      authToken?: string;
      user?: JwtTokenPayload;
    }
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.BEARER_TOKEN_REQUIRED,
      );
    }

    const token = authHeader.substring(7);
    req.authToken = token;

    try {
      const decoded = jwt.decode(token) as JwtTokenPayload;

      if (!decoded) {
        throw new UnauthorizedException("Invalid token");
      }

      if (!decoded.userId || !decoded.firmId) {
        throw new UnauthorizedException(
          "Invalid token: missing required claims (userId, firmId)",
        );
      }

      req.user = {
        userId: decoded.userId,
        firmId: decoded.firmId,
      };

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Failed to decode token");
    }
  }
}

import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtTokenPayload } from "../../../shared/types/jwt-token.interface";

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtTokenPayload | undefined,
    ctx: ExecutionContext,
  ): JwtTokenPayload | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new Error(
        "User not found in request. Did you forget to apply AuthMiddleware?",
      );
    }

    return data ? user[data] : user;
  },
);

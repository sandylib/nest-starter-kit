import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { LoggerProvider } from "../../infrastructure/logging/logger.provider";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerProvider) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    this.logger.info("Incoming request", "http", {
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      contentType: req.get("Content-Type"),
      contentLength: req.get("Content-Length"),
    });

    res.on("finish", () => {
      const responseTime = Date.now() - start;
      this.logger.logHttpRequest(req, res, responseTime);
    });

    next();
  }
}

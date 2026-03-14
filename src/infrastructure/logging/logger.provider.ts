import { Injectable } from "@nestjs/common";
import { createLogger, Logger, format, transports } from "winston";
import * as winston from "winston";
const SumoLogic = require("winston-sumologic-transport").SumoLogic;
import { LOGGING } from "../../shared/constants/logging.constants";
import { AppConfigProvider } from "../config/app-config.provider";
import { bootstrapLogger } from "./bootstrap-logger";

@Injectable()
export class LoggerProvider {
  private readonly logger: Logger;

  constructor(private readonly appConfigProvider: AppConfigProvider) {
    const config = this.appConfigProvider.get();
    this.logger = this.createLogger(config);
  }

  info(message: string, category?: string, meta?: Record<string, any>) {
    this.logger.info(message, { category, ...meta });
  }

  error(
    message: string,
    error?: Error,
    category?: string,
    meta?: Record<string, any>,
  ) {
    this.logger.error(message, {
      category,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
      ...meta,
    });
  }

  warn(message: string, category?: string, meta?: Record<string, any>) {
    this.logger.warn(message, { category, ...meta });
  }

  debug(message: string, category?: string, meta?: Record<string, any>) {
    this.logger.debug(message, { category, ...meta });
  }

  logHttpRequest(req: any, res: any, responseTime: number) {
    this.info("HTTP Request", LOGGING.CATEGORIES.HTTP, {
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      contentLength: res.get("Content-Length"),
    });
  }

  logAuthEvent(event: string, userId?: string, meta?: Record<string, any>) {
    this.info(`Auth: ${event}`, LOGGING.CATEGORIES.AUTH, {
      userId,
      ...meta,
    });
  }

  logApiCall(
    url: string,
    method: string,
    statusCode: number,
    responseTime: number,
    meta?: Record<string, any>,
  ) {
    this.info("External API Call", LOGGING.CATEGORIES.API, {
      url,
      method,
      statusCode,
      responseTime: `${responseTime}ms`,
      ...meta,
    });
  }

  logSecurityEvent(event: string, meta?: Record<string, any>) {
    this.warn(`Security: ${event}`, LOGGING.CATEGORIES.SECURITY, meta);
  }

  logPerformance(
    operation: string,
    duration: number,
    meta?: Record<string, any>,
  ) {
    this.info(`Performance: ${operation}`, LOGGING.CATEGORIES.PERFORMANCE, {
      duration: `${duration}ms`,
      ...meta,
    });
  }

  private createLogger(config: any): Logger {
    const loggerTransports: winston.transport[] = [];

    const sumoFormat = format.printf((info) => {
      const {
        timestamp,
        level,
        message,
        category,
        error,
        service,
        component,
        environment,
        ...meta
      } = info;

      const logEntry: any = {
        time: timestamp,
        level,
        app_id: service || LOGGING.METADATA.SERVICE,
        environment: environment || config.app.environment,
        message,
      };

      if (component) logEntry.component = component;
      if (config.app.version) logEntry.version = config.app.version;
      if (config.regional?.region) logEntry.region = config.regional.region;

      const metaData: any = {};
      if (category) metaData.category = category;
      if (error) metaData.exception = error;
      if (Object.keys(meta).length > 0) {
        Object.assign(metaData, meta);
      }

      if (Object.keys(metaData).length > 0) {
        logEntry.meta = metaData;
      }

      return JSON.stringify(logEntry);
    });

    if (config.app.environment === "local") {
      loggerTransports.push(
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: LOGGING.FORMATS.TIMESTAMP }),
            format.printf(
              ({ timestamp, level, message, category, ...meta }) => {
                const metaString = Object.keys(meta).length
                  ? JSON.stringify(meta)
                  : "";
                return `${timestamp} [${level}] ${category ? `[${category}]` : ""} ${message} ${metaString}`;
              },
            ),
          ),
        }),
      );
    }

    const sumoUrl = config.logging?.sumoLogicUrl;
    const isValidUrl =
      sumoUrl &&
      (sumoUrl.startsWith("http://") || sumoUrl.startsWith("https://"));

    if (isValidUrl && config.app.environment !== "local") {
      bootstrapLogger.info(
        `[Logger] Adding SumoLogic transport with URL: ${sumoUrl}`,
      );
      loggerTransports.push(
        new SumoLogic({
          url: sumoUrl,
          level: config.logging?.level || LOGGING.LEVELS.INFO,
          label: `${LOGGING.METADATA.SERVICE}_${config.app.environment}`,
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss[Z]" }),
            sumoFormat,
          ),
        }),
      );
    } else if (sumoUrl && config.app.environment !== "local") {
      bootstrapLogger.warn(
        `[Logger] SUMO_ENDPOINT is set but not a valid URL: "${sumoUrl}"`,
      );
    } else if (!sumoUrl && config.app.environment !== "local") {
      bootstrapLogger.warn(
        `[Logger] SUMO_ENDPOINT not configured for environment: ${config.app.environment}`,
      );
    }

    return createLogger({
      level: config.logging?.level || LOGGING.LEVELS.INFO,
      format: format.combine(
        format.timestamp({ format: LOGGING.FORMATS.TIMESTAMP }),
        format.errors({ stack: true }),
        format.json(),
      ),
      defaultMeta: {
        service: LOGGING.METADATA.SERVICE,
        component: LOGGING.METADATA.COMPONENT,
        environment: config.app.environment,
      },
      transports: loggerTransports,
    });
  }
}

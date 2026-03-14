import { createLogger, Logger, format, transports } from "winston";
import * as winston from "winston";
const SumoLogic = require("winston-sumologic-transport").SumoLogic;

class BootstrapLogger {
  private readonly logger: Logger;

  constructor() {
    const environment = process.env.ENVIRONMENT || "local";
    const isLocal = environment === "local";

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
        environment: env,
        ...meta
      } = info;

      const logEntry: any = {
        time: timestamp,
        level,
        app_id: service || "nest-starter-kit",
        environment: env || environment,
        message,
      };

      if (component) logEntry.component = component;

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

    if (isLocal) {
      loggerTransports.push(
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.printf(({ timestamp, level, message, ...meta }) => {
              const metaString =
                Object.keys(meta).length > 0 ? JSON.stringify(meta) : "";
              return `${timestamp} [${level}] [BOOTSTRAP] ${message} ${metaString}`;
            }),
          ),
        }),
      );
    } else {
      loggerTransports.push(
        new transports.Console({
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss[Z]" }),
            format.json(),
          ),
        }),
      );
    }

    const sumoUrl = process.env.SUMO_ENDPOINT;
    const isValidUrl =
      sumoUrl &&
      (sumoUrl.startsWith("http://") || sumoUrl.startsWith("https://"));

    if (isValidUrl && !isLocal) {
      console.log(
        `[BootstrapLogger] Adding SumoLogic transport with URL: ${sumoUrl}`,
      );
      loggerTransports.push(
        new SumoLogic({
          url: sumoUrl,
          level: "info",
          label: `nest-starter-kit_${environment}`,
          format: format.combine(
            format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss[Z]" }),
            sumoFormat,
          ),
        }),
      );
    } else if (!isLocal) {
      console.warn(
        `[BootstrapLogger] SUMO_ENDPOINT not configured or invalid: "${sumoUrl}"`,
      );
    }

    this.logger = createLogger({
      level: "info",
      format: format.combine(
        format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss[Z]" }),
        format.errors({ stack: true }),
        format.json(),
      ),
      defaultMeta: {
        service: "nest-starter-kit",
        component: "bootstrap",
        environment,
      },
      transports: loggerTransports,
    });
  }

  info(message: string, meta?: Record<string, any>) {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, any>) {
    this.logger.error(message, {
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      ...meta,
    });
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, any>) {
    this.logger.debug(message, meta);
  }
}

export const bootstrapLogger = new BootstrapLogger();

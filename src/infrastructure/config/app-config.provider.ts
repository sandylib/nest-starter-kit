import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../shared/types/app-config.interface";
import { CONFIG_DEFAULTS } from "../../shared/constants/config-defaults.constants";
import { VALIDATION_ERROR_MESSAGES } from "../../shared/constants/errors/validation-errors.constants";
import * as packageJson from "../../../package.json";

@Injectable()
export class AppConfigProvider {
  private readonly config: AppConfig;

  constructor(private readonly configService: ConfigService) {
    const environment = this.getString(
      "ENVIRONMENT",
      CONFIG_DEFAULTS.APP.ENVIRONMENT,
    );

    this.config = {
      app: {
        name: packageJson.name,
        version: packageJson.version,
        port: this.getRequiredNumber("PORT"),
        environment,
      },
      api: {
        baseUrl: this.getRequiredString("API_BASE_URL"),
        timeout: CONFIG_DEFAULTS.API.TIMEOUT,
      },
      cors: {
        credentials: CONFIG_DEFAULTS.CORS.CREDENTIALS,
        methods: CONFIG_DEFAULTS.CORS.METHODS,
        allowedHeaders: CONFIG_DEFAULTS.CORS.ALLOWED_HEADERS,
        origin: (
          origin: string | undefined,
          cb: (err: Error | null, allow?: boolean) => void,
        ) => {
          if (!origin) return cb(null, true);
          if (CONFIG_DEFAULTS.CORS.WHITELIST.includes(origin))
            return cb(null, true);
          console.warn(`CORS blocked: ${origin} (not in whitelist)`);
          return cb(new Error(`CORS not allowed for origin: ${origin}`));
        },
      },
      regional: {
        region: this.getRequiredString("REGION"),
      },
      logging: this.getLoggingConfig(environment),
      database: this.getDatabaseConfig(),
    };
  }

  private getLoggingConfig(environment: string) {
    const isLocal = environment === "local";

    return {
      level: isLocal ? "debug" : "info",
      format: isLocal ? "pretty" : "json",
      enabled: true,
      sumoLogicUrl: this.configService.get<string>("SUMO_ENDPOINT"),
    };
  }

  private getDatabaseConfig() {
    const url = this.configService.get<string>("DATABASE_URL");

    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. For deployed environments, it should be fetched from Parameter Store. For local development, set it in .env file.",
      );
    }

    return { url };
  }

  get(): AppConfig {
    return this.config;
  }

  private getString(key: string, defaultValue: string): string {
    return this.configService.get<string>(key) || defaultValue;
  }

  private getRequiredString(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${VALIDATION_ERROR_MESSAGES.MISSING_ENV_VAR}: ${key}`);
    }
    return value;
  }

  private getRequiredNumber(key: string): number {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${VALIDATION_ERROR_MESSAGES.MISSING_ENV_VAR}: ${key}`);
    }
    const numValue = parseInt(value, CONFIG_DEFAULTS.PARSING.RADIX);
    if (isNaN(numValue)) {
      throw new Error(
        `Environment variable ${key} ${VALIDATION_ERROR_MESSAGES.INVALID_NUMBER}`,
      );
    }
    return numValue;
  }
}

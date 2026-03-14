import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

export interface AppConfig {
  app: {
    name: string;
    version: string;
    port: number;
    environment: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  cors: {
    origin: CorsOptions["origin"];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
  regional: {
    region: string;
  };
  logging: {
    level: string;
    format: string;
    enabled: boolean;
    sumoLogicUrl?: string;
  };
  database: {
    url: string;
  };
}

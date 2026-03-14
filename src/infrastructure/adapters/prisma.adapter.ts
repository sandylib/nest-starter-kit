import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from ".prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { AppConfigProvider } from "../config/app-config.provider";

@Injectable()
export class PrismaAdapter
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly appConfig: AppConfigProvider) {
    const config = appConfig.get();
    const databaseConfig = config.database;

    const sslDisabled =
      databaseConfig.url.includes("sslmode=disable") ||
      config.app.environment === "local";

    const pool = new Pool({
      connectionString: databaseConfig.url,
      ssl: sslDisabled
        ? false
        : {
            rejectUnauthorized: false,
          },
    });

    const adapter = new PrismaPg(pool as any);

    super({
      adapter,
      log: ["error", "warn"],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }
}

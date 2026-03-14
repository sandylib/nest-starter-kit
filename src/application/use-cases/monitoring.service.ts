import { Injectable } from "@nestjs/common";
import { AppConfigProvider } from "../../infrastructure/config/app-config.provider";
import { PrismaAdapter } from "../../infrastructure/adapters/prisma.adapter";
import { MONITORING } from "../../shared/constants/domains/monitoring.constants";

@Injectable()
export class MonitoringService {
  constructor(
    private readonly appConfig: AppConfigProvider,
    private readonly prisma: PrismaAdapter,
  ) {}

  getHealth() {
    const config = this.appConfig.get();

    return {
      status: MONITORING.HEALTH.STATUS.OK,
      timestamp: new Date().toISOString(),
      service: MONITORING.HEALTH.SERVICE.NAME,
      version: config.app.version,
    };
  }

  async getPingdom() {
    const config = this.appConfig.get();
    const dbHealthy = await this.prisma.isHealthy();

    const status = dbHealthy
      ? MONITORING.HEALTH.STATUS.OK
      : MONITORING.HEALTH.STATUS.DEGRADED;

    return {
      status,
      timestamp: new Date().toISOString(),
      service: MONITORING.HEALTH.SERVICE.NAME,
      version: config.app.version,
      database: {
        status: dbHealthy
          ? MONITORING.HEALTH.STATUS.OK
          : MONITORING.HEALTH.STATUS.ERROR,
        connected: dbHealthy,
      },
    };
  }

  getInfo() {
    const config = this.appConfig.get();

    return {
      name: config.app.name,
      description: MONITORING.HEALTH.SERVICE.DESCRIPTION,
      version: config.app.version,
      environment: config.app.environment,
    };
  }
}

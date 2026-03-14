import { Module } from "@nestjs/common";
import { PrismaAdapter } from "../adapters/prisma.adapter";
import { MonitoringService } from "../../application/use-cases/monitoring.service";
import { MonitoringController } from "../../presentation/web/controllers/monitoring/monitoring.controller";

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, PrismaAdapter],
})
export class MonitoringModule {}

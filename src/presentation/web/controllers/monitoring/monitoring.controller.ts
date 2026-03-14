import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { MONITORING } from "../../../../shared/constants/domains/monitoring.constants";
import { HTTP_STATUS } from "../../../../shared/constants/http.constants";
import { MonitoringService } from "../../../../application/use-cases/monitoring.service";

@ApiTags(MONITORING.ROUTES.TAG)
@Controller(MONITORING.ROUTES.BASE)
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get(MONITORING.ROUTES.ENDPOINTS.HEALTH)
  @ApiOperation({ summary: MONITORING.DOCS.HEALTH.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.SUCCESS,
    description: MONITORING.DOCS.HEALTH.RESPONSE,
  })
  getHealth() {
    return this.monitoringService.getHealth();
  }

  @Get(MONITORING.ROUTES.ENDPOINTS.PINGDOM)
  @ApiOperation({ summary: MONITORING.DOCS.PINGDOM.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.SUCCESS,
    description: MONITORING.DOCS.PINGDOM.RESPONSE,
  })
  @ApiResponse({
    status: HTTP_STATUS.SERVICE_UNAVAILABLE,
    description: MONITORING.DOCS.PINGDOM.SERVICE_UNAVAILABLE,
  })
  async getPingdom() {
    return await this.monitoringService.getPingdom();
  }
}

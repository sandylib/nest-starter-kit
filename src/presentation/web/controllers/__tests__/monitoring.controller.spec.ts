import { Test, TestingModule } from "@nestjs/testing";
import { MonitoringController } from "../monitoring/monitoring.controller";
import { MonitoringService } from "../../../../application/use-cases/monitoring.service";

describe("MonitoringController", () => {
  let controller: MonitoringController;
  let service: jest.Mocked<MonitoringService>;

  beforeEach(async () => {
    const mockService = {
      getHealth: jest.fn(),
      getPingdom: jest.fn(),
      getInfo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonitoringController],
      providers: [{ provide: MonitoringService, useValue: mockService }],
    }).compile();

    controller = module.get<MonitoringController>(MonitoringController);
    service = module.get(MonitoringService);
  });

  describe("getHealth", () => {
    it("should return health status", () => {
      const healthResponse = {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "nest-starter-kit",
        version: "1.0.0",
      };
      service.getHealth.mockReturnValue(healthResponse);

      const result = controller.getHealth();

      expect(result.status).toBe("ok");
      expect(service.getHealth).toHaveBeenCalled();
    });
  });

  describe("getPingdom", () => {
    it("should return pingdom status", async () => {
      const pingdomResponse = {
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "nest-starter-kit",
        version: "1.0.0",
        database: { status: "ok", connected: true },
      };
      service.getPingdom.mockResolvedValue(pingdomResponse);

      const result = await controller.getPingdom();

      expect(result.status).toBe("ok");
      expect(result.database.connected).toBe(true);
    });
  });
});

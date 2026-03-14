import { Test, TestingModule } from "@nestjs/testing";
import { MonitoringService } from "../monitoring.service";
import { AppConfigProvider } from "../../../infrastructure/config/app-config.provider";
import { PrismaAdapter } from "../../../infrastructure/adapters/prisma.adapter";
import { createMockConfig } from "../../../shared/testing";

describe("MonitoringService", () => {
  let service: MonitoringService;
  let prisma: jest.Mocked<PrismaAdapter>;

  const mockConfig = createMockConfig();

  beforeEach(async () => {
    const mockAppConfig = {
      get: jest.fn().mockReturnValue(mockConfig),
    };

    const mockPrisma = {
      isHealthy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        { provide: AppConfigProvider, useValue: mockAppConfig },
        { provide: PrismaAdapter, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MonitoringService>(MonitoringService);
    prisma = module.get(PrismaAdapter);
  });

  describe("getHealth", () => {
    it("should return health status", () => {
      const result = service.getHealth();

      expect(result.status).toBe("ok");
      expect(result.service).toBe("nest-starter-kit");
      expect(result.version).toBe("1.0.0");
      expect(result.timestamp).toBeDefined();
    });
  });

  describe("getPingdom", () => {
    it("should return ok when database is healthy", async () => {
      prisma.isHealthy.mockResolvedValue(true);

      const result = await service.getPingdom();

      expect(result.status).toBe("ok");
      expect(result.database.connected).toBe(true);
      expect(result.database.status).toBe("ok");
    });

    it("should return degraded when database is unhealthy", async () => {
      prisma.isHealthy.mockResolvedValue(false);

      const result = await service.getPingdom();

      expect(result.status).toBe("degraded");
      expect(result.database.connected).toBe(false);
      expect(result.database.status).toBe("error");
    });
  });

  describe("getInfo", () => {
    it("should return service info", () => {
      const result = service.getInfo();

      expect(result.name).toBe("test-app");
      expect(result.version).toBe("1.0.0");
      expect(result.environment).toBe("local");
    });
  });
});

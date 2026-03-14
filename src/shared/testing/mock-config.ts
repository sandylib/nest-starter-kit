import { AppConfig } from "../types/app-config.interface";

export const createMockConfig = (overrides?: Partial<AppConfig>): AppConfig => {
  const defaultConfig: AppConfig = {
    app: {
      name: "test-app",
      version: "1.0.0",
      port: 3000,
      environment: "local",
    },
    api: {
      baseUrl: "https://api.test.com",
      timeout: 30000,
    },
    cors: {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
    },
    regional: {
      region: "au",
    },
    logging: {
      level: "debug",
      format: "pretty",
      enabled: true,
      sumoLogicUrl: undefined,
    },
    database: {
      url: "postgresql://test:test@localhost:5432/testdb",
    },
  };

  return {
    ...defaultConfig,
    ...overrides,
  };
};

export const createMockConfigForRegion = (region: string): AppConfig => {
  return createMockConfig({
    regional: { region },
  });
};

export const createMockConfigForEnvironment = (
  environment: string,
): AppConfig => {
  return createMockConfig({
    app: {
      name: "test-app",
      version: "1.0.0",
      port: 3000,
      environment,
    },
  });
};

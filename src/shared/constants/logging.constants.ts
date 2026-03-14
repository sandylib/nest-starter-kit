export const LOGGING = {
  LEVELS: {
    ERROR: "error",
    WARN: "warn",
    INFO: "info",
    DEBUG: "debug",
    VERBOSE: "verbose",
  },
  FORMATS: {
    TIMESTAMP: "YYYY-MM-DD HH:mm:ss",
    JSON: "json",
    SIMPLE: "simple",
  },
  TRANSPORTS: {
    CONSOLE: "console",
    SUMOLOGIC: "sumologic",
  },
  METADATA: {
    SERVICE: "nest-starter-kit",
    COMPONENT: "bff",
    ENVIRONMENT: process.env.NODE_ENV || "development",
  },
  CATEGORIES: {
    HTTP: "http",
    AUTH: "auth",
    API: "api",
    ERROR: "error",
    SECURITY: "security",
    PERFORMANCE: "performance",
  },
} as const;

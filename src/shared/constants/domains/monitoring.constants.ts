export const MONITORING = {
  ROUTES: {
    BASE: "",
    TAG: "monitoring",
    ENDPOINTS: {
      HEALTH: "healthcheck",
      PINGDOM: "pingdom",
    },
  },
  DOCS: {
    HEALTH: {
      OPERATION: "Health check endpoint",
      RESPONSE: "Service is healthy",
    },
    PINGDOM: {
      OPERATION: "Pingdom uptime check endpoint",
      RESPONSE: "Pingdom check passed",
      SERVICE_UNAVAILABLE: "Service is unavailable",
    },
  },
  HEALTH: {
    STATUS: {
      OK: "ok",
      ERROR: "error",
      WARNING: "warning",
      DEGRADED: "degraded",
    },
    SERVICE: {
      NAME: "nest-starter-kit",
      DESCRIPTION: "NestJS starter kit service",
    },
  },
} as const;

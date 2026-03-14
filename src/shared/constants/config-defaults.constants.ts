export const CONFIG_DEFAULTS = {
  APP: {
    ENVIRONMENT: "local",
  },
  API: {
    TIMEOUT: 30000,
  },
  CORS: {
    CREDENTIALS: true,
    METHODS: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"] as string[],
    ALLOWED_HEADERS: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ] as string[],
    WHITELIST: generateFrontendWhitelist(),
  },
  PARSING: {
    BOOLEAN_TRUE: "true",
    ARRAY_DELIMITER: ",",
    RADIX: 10,
  },
  LOGGING: {
    LEVEL: "info",
    FORMAT: "json",
    ENABLED: true,
  },
} as const;

function generateFrontendWhitelist(): string[] {
  const regions = ["au", "ca", "uk", "us", "nz"];
  const environments = ["dev", "test", "live"];

  const domains: string[] = [];

  domains.push("http://localhost:3000");
  domains.push("http://localhost:4000");

  // Update these domain patterns to match your application
  for (const region of regions) {
    for (const env of environments) {
      domains.push(`https://frontend.${region}.${env}.leap365.com`);
      domains.push(`https://bff.${region}.${env}.leap365.com`);
    }
  }

  return domains;
}

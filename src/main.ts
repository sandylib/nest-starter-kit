import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { execSync } from "child_process";

import { AppModule } from "./app.module";
import { AppConfigProvider } from "./infrastructure/config/app-config.provider";
import {
  DatabaseExceptionFilter,
  ExternalApiExceptionFilter,
} from "./infrastructure/filters";
import { bootstrapLogger } from "./infrastructure/logging/bootstrap-logger";

// Update this SSM parameter path for your application
const DB_SSM_PARAMETER_NAME = "/your-app/database/writer";

async function ensureDatabaseUrl(): Promise<void> {
  if (process.env.DATABASE_URL) {
    bootstrapLogger.info("Using DATABASE_URL from environment variables");
    return;
  }

  bootstrapLogger.info(
    `DATABASE_URL not set. Fetching from SSM parameter: ${DB_SSM_PARAMETER_NAME}`,
  );

  try {
    const client = new SSMClient({
      region: process.env.AWS_REGION || "ap-southeast-2",
    });

    const command = new GetParameterCommand({
      Name: DB_SSM_PARAMETER_NAME,
      WithDecryption: true,
    });

    const response = await client.send(command);
    const rawValue = response.Parameter?.Value;

    if (!rawValue) {
      throw new Error(`SSM parameter has no value: ${DB_SSM_PARAMETER_NAME}`);
    }

    const allowedKeys = new Set([
      "server",
      "database",
      "user",
      "password",
      "port",
    ]);

    const parts = Object.fromEntries(
      rawValue
        .split(";")
        .map((segment) => segment.trim())
        .filter(Boolean)
        .map((segment) => {
          const [key, ...rest] = segment.split("=");
          const normalizedKey = key.trim().toLowerCase();
          if (!allowedKeys.has(normalizedKey)) return null;
          return [normalizedKey, rest.join("=").trim()];
        })
        .filter((entry): entry is [string, string] => Array.isArray(entry)),
    );

    const host = parts.server;
    const database = parts.database;
    const user = parts.user;
    const password = parts.password;
    const port = parts.port;

    if (!host || !database || !user || !password || !port) {
      throw new Error(
        `Invalid DB connection string in SSM. Parsed values: ` +
          `server=${host}, database=${database}, user=${user}, password=${
            password ? "***" : "MISSING"
          }, port=${port}`,
      );
    }

    const prismaUrl = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;

    process.env.DATABASE_URL = prismaUrl;
    bootstrapLogger.info("DATABASE_URL successfully constructed from SSM");
  } catch (error) {
    bootstrapLogger.error("Failed to load DATABASE_URL from SSM", error);
    throw error;
  }
}

function runMigrations(): void {
  try {
    bootstrapLogger.info("Running database migrations...");
    const output = execSync("npx prisma migrate deploy", {
      encoding: "utf8",
      stdio: ["inherit", "pipe", "pipe"],
    });
    if (output) {
      bootstrapLogger.info("Migration output:", { output });
    }
    bootstrapLogger.info("Database migrations complete");
  } catch (error: any) {
    const errorDetails: any = {
      message: error?.message,
      status: error?.status,
    };

    if (error?.stdout) {
      errorDetails.stdout = error.stdout.toString();
    }
    if (error?.stderr) {
      errorDetails.stderr = error.stderr.toString();
    }

    bootstrapLogger.error("Database migrations failed", error, errorDetails);
    throw error;
  }
}

function setupSwagger(app: any, config: ReturnType<AppConfigProvider["get"]>) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.app.name)
    .setDescription("Backend for Frontend API")
    .setVersion(config.app.version)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("swagger", app, document);

  app.use("/", (req, res, next) => {
    if (req.path === "/" && req.method === "GET") {
      return res.redirect("/swagger");
    }
    next();
  });
}

async function bootstrap(): Promise<void> {
  await ensureDatabaseUrl();
  runMigrations();

  const app = await NestFactory.create(AppModule);

  const appConfig = app.get(AppConfigProvider);
  const config = appConfig.get();

  app.useGlobalFilters(
    new DatabaseExceptionFilter(),
    new ExternalApiExceptionFilter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: config.cors.origin,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
    credentials: config.cors.credentials,
  });

  setupSwagger(app, config);

  await app.listen(config.app.port);

  bootstrapLogger.info(
    `Service running on: http://localhost:${config.app.port}`,
  );
  bootstrapLogger.info(
    `Swagger documentation available at: http://localhost:${config.app.port}/swagger`,
  );
}

bootstrap().catch((error) => {
  bootstrapLogger.error("Application failed to start", error);
  process.exit(1);
});

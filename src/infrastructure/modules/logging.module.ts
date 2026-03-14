import { Global, Module } from "@nestjs/common";
import { LoggerProvider } from "../logging/logger.provider";

@Global()
@Module({
  providers: [LoggerProvider],
  exports: [LoggerProvider],
})
export class LoggingModule {}

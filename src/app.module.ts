import {
  Global,
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {
  MonitoringModule,
  ProductsModule,
  CartsModule,
  PaymentsModule,
  CheckoutModule,
  LoggingModule,
} from "./infrastructure/modules";
import { AuthMiddleware, LoggingMiddleware } from "./core";
import { AppConfigProvider } from "./infrastructure/config/app-config.provider";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule,
    MonitoringModule,
    ProductsModule,
    CartsModule,
    PaymentsModule,
    CheckoutModule,
  ],
  providers: [AppConfigProvider],
  exports: [AppConfigProvider],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");

    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: "/healthcheck", method: RequestMethod.GET },
        { path: "/pingdom", method: RequestMethod.GET },
        { path: "/swagger", method: RequestMethod.ALL },
        { path: "/swagger/(.*)", method: RequestMethod.ALL },
      )
      .forRoutes("*");
  }
}

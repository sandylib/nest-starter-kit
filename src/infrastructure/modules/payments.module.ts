import { Module } from "@nestjs/common";
import { PrismaAdapter } from "../adapters/prisma.adapter";
import { PaymentStrategyRegistry } from "../../application/strategies/payment-strategy.registry";
import { PaymentsService } from "../../application/use-cases/payments.service";
import { PaymentsController } from "../../presentation/web/controllers/payments/payments.controller";
import { CartsModule } from "./carts.module";

@Module({
  imports: [CartsModule],
  controllers: [PaymentsController],
  providers: [PaymentStrategyRegistry, PaymentsService, PrismaAdapter],
  exports: [PaymentsService],
})
export class PaymentsModule {}

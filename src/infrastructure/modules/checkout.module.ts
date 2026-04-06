import { Module } from "@nestjs/common";
import { PrismaAdapter } from "../adapters/prisma.adapter";
import { PaymentStrategyRegistry } from "../../application/strategies/payment-strategy.registry";
import { CheckoutService } from "../../application/use-cases/checkout.service";
import { CheckoutController } from "../../presentation/web/controllers/checkout/checkout.controller";

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService, PaymentStrategyRegistry, PrismaAdapter],
  exports: [CheckoutService],
})
export class CheckoutModule {}

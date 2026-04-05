import { Injectable, BadRequestException } from "@nestjs/common";
import { Payment } from "../../core/entities/payment.entity";
import { PaymentStrategyRegistry } from "../strategies/payment-strategy.registry";
import { PaymentMethod, PaymentInput } from "../strategies/payment.strategy";
import { CartsService } from "./carts.service";
import { LoggerProvider } from "../../infrastructure/logging/logger.provider";
import { BUSINESS_ERROR_MESSAGES } from "../../shared/constants/errors/business-errors.constants";
import { LOGGING } from "../../shared/constants/logging.constants";
import { CARTS } from "../../shared/constants/domains/carts.constants";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly strategyRegistry: PaymentStrategyRegistry,
    private readonly cartsService: CartsService,
    private readonly logger: LoggerProvider,
  ) {}

  async checkout(
    userId: string,
    cartId: string,
    method: PaymentMethod,
    amount: number,
    currency: string,
    paymentDetails?: Record<string, unknown>,
  ): Promise<Payment> {
    this.logger.info("Processing checkout", LOGGING.CATEGORIES.API, {
      userId,
      cartId,
      method,
    });

    const cart = await this.cartsService.findById(cartId);

    if (cart.status !== CARTS.STATUS.ACTIVE) {
      throw new BadRequestException(BUSINESS_ERROR_MESSAGES.CART_NOT_ACTIVE);
    }

    const strategy = this.strategyRegistry.resolve(method);

    if (paymentDetails && !strategy.validatePaymentDetails(paymentDetails)) {
      throw new BadRequestException(
        BUSINESS_ERROR_MESSAGES.INVALID_PAYMENT_DETAILS,
      );
    }

    const input: PaymentInput = { amount, currency, cartId, userId };
    const result = await strategy.processPayment(input);
    const fee = strategy.getTransactionFee(amount);

    const factory = this.strategyRegistry.resolveFactory(method);
    const record = factory.buildTransactionRecord(input, result, fee);

    this.logger.info("Payment processed", LOGGING.CATEGORIES.API, {
      transactionId: record.transactionId,
      status: record.status,
      method: record.method,
      fee: record.fee,
    });

    return record;
  }

  getSupportedMethods() {
    return this.strategyRegistry.getSupportedMethods().map((method) => {
      const strategy = this.strategyRegistry.resolve(method);
      return {
        method,
        sampleFee: strategy.getTransactionFee(100),
      };
    });
  }
}

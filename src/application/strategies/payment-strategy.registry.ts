import { Injectable, BadRequestException } from "@nestjs/common";
import { PaymentMethod, PaymentStrategy } from "./payment.strategy";
import { CreditCardPaymentStrategy } from "./credit-card-payment.strategy";
import { PayPalPaymentStrategy } from "./paypal-payment.strategy";
import { BankTransferPaymentStrategy } from "./bank-transfer-payment.strategy";
import { PaymentRecordFactory } from "../factories/payment-record.factory";
import { CreditCardRecordFactory } from "../factories/credit-card-record.factory";
import { PayPalRecordFactory } from "../factories/paypal-record.factory";
import { BankTransferRecordFactory } from "../factories/bank-transfer-record.factory";
import { BUSINESS_ERROR_MESSAGES } from "../../shared/constants/errors/business-errors.constants";

@Injectable()
export class PaymentStrategyRegistry {
  private readonly strategies: Map<string, PaymentStrategy>;
  private readonly factories: Map<string, PaymentRecordFactory>;

  constructor() {
    const creditCard = new CreditCardPaymentStrategy();
    const paypal = new PayPalPaymentStrategy();
    const bankTransfer = new BankTransferPaymentStrategy();

    this.strategies = new Map<string, PaymentStrategy>([
      [creditCard.method, creditCard],
      [paypal.method, paypal],
      [bankTransfer.method, bankTransfer],
    ]);

    const creditCardFactory = new CreditCardRecordFactory();
    const paypalFactory = new PayPalRecordFactory();
    const bankTransferFactory = new BankTransferRecordFactory();

    this.factories = new Map<string, PaymentRecordFactory>([
      [creditCardFactory.method, creditCardFactory],
      [paypalFactory.method, paypalFactory],
      [bankTransferFactory.method, bankTransferFactory],
    ]);
  }

  resolve(method: PaymentMethod): PaymentStrategy {
    const strategy = this.strategies.get(method);
    if (!strategy) {
      throw new BadRequestException(
        `${BUSINESS_ERROR_MESSAGES.UNSUPPORTED_PAYMENT_METHOD}: ${method}`,
      );
    }
    return strategy;
  }

  resolveFactory(method: PaymentMethod): PaymentRecordFactory {
    const factory = this.factories.get(method);
    if (!factory) {
      throw new BadRequestException(
        `${BUSINESS_ERROR_MESSAGES.UNSUPPORTED_PAYMENT_METHOD}: ${method}`,
      );
    }
    return factory;
  }

  getSupportedMethods(): PaymentMethod[] {
    return Array.from(this.strategies.keys()) as PaymentMethod[];
  }
}

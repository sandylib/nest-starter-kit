import { Injectable, BadRequestException } from "@nestjs/common";
import { PaymentMethod, PaymentStrategy } from "./payment.strategy";
import { CreditCardPaymentStrategy } from "./credit-card-payment.strategy";
import { PayPalPaymentStrategy } from "./paypal-payment.strategy";
import { BankTransferPaymentStrategy } from "./bank-transfer-payment.strategy";
import { BUSINESS_ERROR_MESSAGES } from "../../shared/constants/errors/business-errors.constants";

@Injectable()
export class PaymentStrategyRegistry {
  private readonly strategies: Map<string, PaymentStrategy>;

  constructor() {
    const creditCard = new CreditCardPaymentStrategy();
    const paypal = new PayPalPaymentStrategy();
    const bankTransfer = new BankTransferPaymentStrategy();

    this.strategies = new Map<string, PaymentStrategy>([
      [creditCard.method, creditCard],
      [paypal.method, paypal],
      [bankTransfer.method, bankTransfer],
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

  getSupportedMethods(): PaymentMethod[] {
    return Array.from(this.strategies.keys()) as PaymentMethod[];
  }
}

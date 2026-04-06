import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Decimal } from "@prisma/client/runtime/library";
import { PrismaAdapter } from "../../infrastructure/adapters/prisma.adapter";
import { LoggerProvider } from "../../infrastructure/logging/logger.provider";
import { PaymentStrategyRegistry } from "../strategies/payment-strategy.registry";
import {
  PaymentMethod,
  PaymentInput,
} from "../strategies/payment.strategy";
import { Payment } from "../../core/entities/payment.entity";
import { Order } from "../../core/entities/order.entity";
import { Invoice } from "../../core/entities/invoice.entity";
import { BUSINESS_ERROR_MESSAGES } from "../../shared/constants/errors/business-errors.constants";
import { CARTS } from "../../shared/constants/domains/carts.constants";
import { LOGGING } from "../../shared/constants/logging.constants";

export interface CheckoutResult {
  order: Order;
  invoice: Invoice;
  payment: Payment;
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaAdapter,
    private readonly strategyRegistry: PaymentStrategyRegistry,
    private readonly logger: LoggerProvider,
  ) {}

  async processCheckout(
    userId: string,
    cartId: string,
    method: PaymentMethod,
    currency: string,
    paymentDetails?: Record<string, unknown>,
  ): Promise<CheckoutResult> {
    this.logger.info("Starting checkout", LOGGING.CATEGORIES.API, {
      userId,
      cartId,
      method,
    });

    const strategy = this.strategyRegistry.resolve(method);

    if (paymentDetails && !strategy.validatePaymentDetails(paymentDetails)) {
      throw new BadRequestException(
        BUSINESS_ERROR_MESSAGES.INVALID_PAYMENT_DETAILS,
      );
    }

    // Database operations are wrapped in a transaction so they either
    // all succeed or all roll back. Payment processing (an external call)
    // runs first; only after payment succeeds do we commit DB changes.
    const { order, invoice, totalAmount } = await this.prisma.$transaction(
      async (tx) => {
        // Step 1: Load cart with items and product prices
        const cart = await tx.cart.findUnique({
          where: { id: cartId },
          include: {
            items: {
              include: { product: true },
              orderBy: { createdAt: "asc" },
            },
          },
        });

        if (!cart) {
          throw new NotFoundException(
            BUSINESS_ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          );
        }

        if (cart.status !== CARTS.STATUS.ACTIVE) {
          throw new BadRequestException(
            BUSINESS_ERROR_MESSAGES.CART_NOT_ACTIVE,
          );
        }

        if (cart.items.length === 0) {
          throw new BadRequestException("Cart is empty");
        }

        // Step 2: Validate stock for every item
        for (const item of cart.items) {
          if (item.product.stock < item.quantity) {
            throw new BadRequestException(
              `${BUSINESS_ERROR_MESSAGES.INSUFFICIENT_STOCK}: ${item.product.name}`,
            );
          }
        }

        // Step 3: Deduct stock from each product
        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // Step 4: Create Order with OrderItems
        const calculatedTotal = cart.items.reduce(
          (sum, item) =>
            sum + Number(item.product.price) * item.quantity,
          0,
        );

        const order = await tx.order.create({
          data: {
            userId,
            cartId,
            totalAmount: new Decimal(calculatedTotal.toFixed(2)),
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.product.price,
              })),
            },
          },
          include: { items: true },
        });

        // Step 5: Generate Invoice
        const invoice = await tx.invoice.create({
          data: {
            orderId: order.id,
            invoiceNo: generateInvoiceNo(),
            totalAmount: order.totalAmount,
          },
        });

        // Step 6: Mark cart as completed
        await tx.cart.update({
          where: { id: cartId },
          data: { status: CARTS.STATUS.COMPLETED },
        });

        return {
          order: toOrderEntity(order),
          invoice: toInvoiceEntity(invoice),
          totalAmount: calculatedTotal,
        };
      },
    );

    // Process payment after the transaction commits
    const paymentInput: PaymentInput = {
      amount: totalAmount,
      currency,
      cartId,
      userId,
    };

    const result = await strategy.processPayment(paymentInput);
    const fee = strategy.getTransactionFee(totalAmount);
    const factory = this.strategyRegistry.resolveFactory(method);
    const payment = factory.buildTransactionRecord(paymentInput, result, fee);

    this.logger.info("Checkout completed", LOGGING.CATEGORIES.API, {
      orderId: order.id,
      invoiceNo: invoice.invoiceNo,
      transactionId: payment.transactionId,
    });

    return { order, invoice, payment };
  }
}

function generateInvoiceNo(): string {
  const date = new Date();
  const prefix = "INV";
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${datePart}-${random}`;
}

function toOrderEntity(record: any): Order {
  return {
    id: record.id,
    userId: record.userId,
    cartId: record.cartId,
    status: record.status,
    totalAmount: Number(record.totalAmount),
    items: (record.items || []).map((item: any) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toInvoiceEntity(record: any): Invoice {
  return {
    id: record.id,
    orderId: record.orderId,
    invoiceNo: record.invoiceNo,
    totalAmount: Number(record.totalAmount),
    issuedAt: record.issuedAt,
  };
}

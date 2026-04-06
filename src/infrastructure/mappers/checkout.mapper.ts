import { CheckoutResult } from "../../application/use-cases/checkout.service";
import { CheckoutResponseDto } from "../../presentation/web/dto/checkout.dto";

export function toCheckoutResponseDto(
  result: CheckoutResult,
): CheckoutResponseDto {
  return {
    order: {
      id: result.order.id,
      userId: result.order.userId,
      cartId: result.order.cartId,
      status: result.order.status,
      totalAmount: result.order.totalAmount,
      items: result.order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      createdAt: result.order.createdAt,
    },
    invoice: {
      id: result.invoice.id,
      orderId: result.invoice.orderId,
      invoiceNo: result.invoice.invoiceNo,
      totalAmount: result.invoice.totalAmount,
      issuedAt: result.invoice.issuedAt,
    },
    transactionId: result.payment.transactionId,
    paymentStatus: result.payment.status,
    paymentMethod: result.payment.method,
    fee: result.payment.fee,
  };
}

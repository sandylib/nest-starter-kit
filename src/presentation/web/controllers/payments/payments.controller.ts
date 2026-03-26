import { Controller, Get, Post, Body } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { PAYMENTS } from "../../../../shared/constants/domains/payments.constants";
import { HTTP_STATUS } from "../../../../shared/constants/http.constants";
import { ApiDatabaseDocumentation } from "../../decorators/api-documentation.decorator";
import { PaymentsService } from "../../../../application/use-cases/payments.service";
import { PaymentMethod } from "../../../../application/strategies/payment.strategy";
import { CurrentUser } from "../../decorators/current-user.decorator";
import {
  CheckoutDto,
  PaymentResponseDto,
  PaymentMethodResponseDto,
} from "../../dto/payment.dto";

@ApiTags(PAYMENTS.ROUTES.TAG)
@ApiBearerAuth()
@Controller(PAYMENTS.ROUTES.BASE)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(PAYMENTS.ROUTES.CHECKOUT)
  @ApiOperation({ summary: PAYMENTS.DOCS.CHECKOUT.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.CREATED,
    description: PAYMENTS.DOCS.CHECKOUT.RESPONSE,
    type: PaymentResponseDto,
  })
  @ApiDatabaseDocumentation()
  async checkout(
    @CurrentUser("userId") userId: string,
    @Body() dto: CheckoutDto,
  ): Promise<PaymentResponseDto> {
    const result = await this.paymentsService.checkout(
      userId,
      dto.cartId,
      dto.paymentMethod as PaymentMethod,
      dto.amount,
      dto.currency,
      dto.paymentDetails,
    );

    return {
      transactionId: result.transactionId,
      status: result.status,
      method: result.method,
      amount: result.amount,
      currency: result.currency,
      fee: this.paymentsService
        .getSupportedMethods()
        .find((m) => m.method === result.method)?.sampleFee ?? 0,
      processedAt: result.processedAt,
    };
  }

  @Get(PAYMENTS.ROUTES.METHODS)
  @ApiOperation({ summary: PAYMENTS.DOCS.METHODS.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.SUCCESS,
    description: PAYMENTS.DOCS.METHODS.RESPONSE,
    type: [PaymentMethodResponseDto],
  })
  async getMethods(): Promise<PaymentMethodResponseDto[]> {
    return this.paymentsService.getSupportedMethods();
  }
}

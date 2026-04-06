import { Controller, Post, Body } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CHECKOUT } from "../../../../shared/constants/domains/checkout.constants";
import { HTTP_STATUS } from "../../../../shared/constants/http.constants";
import { ApiDatabaseDocumentation } from "../../decorators/api-documentation.decorator";
import { CheckoutService } from "../../../../application/use-cases/checkout.service";
import { PaymentMethod } from "../../../../application/strategies/payment.strategy";
import { CurrentUser } from "../../decorators/current-user.decorator";
import {
  CheckoutRequestDto,
  CheckoutResponseDto,
} from "../../dto/checkout.dto";
import { toCheckoutResponseDto } from "../../../../infrastructure/mappers/checkout.mapper";

@ApiTags(CHECKOUT.ROUTES.TAG)
@ApiBearerAuth()
@Controller(CHECKOUT.ROUTES.BASE)
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiOperation({ summary: CHECKOUT.DOCS.PROCESS.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.CREATED,
    description: CHECKOUT.DOCS.PROCESS.RESPONSE,
    type: CheckoutResponseDto,
  })
  @ApiDatabaseDocumentation()
  async checkout(
    @CurrentUser("userId") userId: string,
    @Body() dto: CheckoutRequestDto,
  ): Promise<CheckoutResponseDto> {
    const result = await this.checkoutService.processCheckout(
      userId,
      dto.cartId,
      dto.paymentMethod as PaymentMethod,
      dto.currency,
      dto.paymentDetails,
    );

    return toCheckoutResponseDto(result);
  }
}

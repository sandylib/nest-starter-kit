import { Controller, Get, Post, Delete, Param, Body } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CARTS } from "../../../../shared/constants/domains/carts.constants";
import { HTTP_STATUS } from "../../../../shared/constants/http.constants";
import { ApiDatabaseDocumentation } from "../../decorators/api-documentation.decorator";
import { CartsService } from "../../../../application/use-cases/carts.service";
import { CurrentUser } from "../../decorators/current-user.decorator";
import {
  AddToCartDto,
  CartResponseDto,
  CartItemResponseDto,
} from "../../dto/cart.dto";
import {
  toCartDto,
  toCartItemDto,
} from "../../../../infrastructure/mappers/carts.mapper";

@ApiTags(CARTS.ROUTES.TAG)
@ApiBearerAuth()
@Controller(CARTS.ROUTES.BASE)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post()
  @ApiOperation({ summary: CARTS.DOCS.CREATE.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.CREATED,
    description: CARTS.DOCS.CREATE.RESPONSE,
    type: CartResponseDto,
  })
  @ApiDatabaseDocumentation()
  async create(
    @CurrentUser("userId") userId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.cartsService.create(userId);
    return toCartDto(cart);
  }

  @Get(CARTS.ROUTES.PARAMS.ID)
  @ApiOperation({ summary: CARTS.DOCS.GET.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.SUCCESS,
    description: CARTS.DOCS.GET.RESPONSE,
    type: CartResponseDto,
  })
  @ApiDatabaseDocumentation()
  async findById(@Param("id") id: string): Promise<CartResponseDto> {
    const cart = await this.cartsService.findById(id);
    return toCartDto(cart);
  }

  @Post(`${CARTS.ROUTES.PARAMS.ID}/${CARTS.ROUTES.ITEMS}`)
  @ApiOperation({ summary: CARTS.DOCS.ADD_ITEM.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.CREATED,
    description: CARTS.DOCS.ADD_ITEM.RESPONSE,
    type: CartItemResponseDto,
  })
  @ApiDatabaseDocumentation()
  async addItem(
    @Param("id") cartId: string,
    @Body() dto: AddToCartDto,
  ): Promise<CartItemResponseDto> {
    const item = await this.cartsService.addItem(
      cartId,
      dto.productId,
      dto.quantity,
    );
    return toCartItemDto(item);
  }

  @Delete(
    `${CARTS.ROUTES.PARAMS.ID}/${CARTS.ROUTES.ITEMS}/${CARTS.ROUTES.PARAMS.ITEM_ID}`,
  )
  @ApiOperation({ summary: CARTS.DOCS.REMOVE_ITEM.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.SUCCESS,
    description: CARTS.DOCS.REMOVE_ITEM.RESPONSE,
  })
  @ApiDatabaseDocumentation()
  async removeItem(
    @Param("id") cartId: string,
    @Param("itemId") itemId: string,
  ): Promise<void> {
    await this.cartsService.removeItem(cartId, itemId);
  }

  @Delete(CARTS.ROUTES.PARAMS.ID)
  @ApiOperation({ summary: CARTS.DOCS.DELETE.OPERATION })
  @ApiResponse({
    status: HTTP_STATUS.SUCCESS,
    description: CARTS.DOCS.DELETE.RESPONSE,
  })
  @ApiDatabaseDocumentation()
  async remove(@Param("id") id: string): Promise<void> {
    await this.cartsService.remove(id);
  }
}

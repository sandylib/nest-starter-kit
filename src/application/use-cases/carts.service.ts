import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaAdapter } from "../../infrastructure/adapters/prisma.adapter";
import { LoggerProvider } from "../../infrastructure/logging/logger.provider";
import { BUSINESS_ERROR_MESSAGES } from "../../shared/constants/errors/business-errors.constants";
import { CARTS } from "../../shared/constants/domains/carts.constants";
import { LOGGING } from "../../shared/constants/logging.constants";

@Injectable()
export class CartsService {
  constructor(
    private readonly prisma: PrismaAdapter,
    private readonly logger: LoggerProvider,
  ) {}

  async create(userId: string) {
    this.logger.info("Creating cart", LOGGING.CATEGORIES.API, { userId });

    return this.prisma.cart.create({
      data: {
        userId,
        status: CARTS.STATUS.ACTIVE,
      },
      include: { items: { include: { product: true } } },
    });
  }

  async findById(id: string) {
    this.logger.info(`Fetching cart ${id}`, LOGGING.CATEGORIES.API);

    const cart = await this.prisma.cart.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException(BUSINESS_ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    return cart;
  }

  async addItem(cartId: string, productId: string, quantity: number) {
    const cart = await this.findById(cartId);

    if (cart.status !== CARTS.STATUS.ACTIVE) {
      throw new BadRequestException(BUSINESS_ERROR_MESSAGES.CART_NOT_ACTIVE);
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(BUSINESS_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(BUSINESS_ERROR_MESSAGES.INSUFFICIENT_STOCK);
    }

    this.logger.info("Adding item to cart", LOGGING.CATEGORIES.API, {
      cartId,
      productId,
      quantity,
    });

    const existingItem = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
    }

    return this.prisma.cartItem.create({
      data: { cartId, productId, quantity },
      include: { product: true },
    });
  }

  async removeItem(cartId: string, itemId: string) {
    const cart = await this.findById(cartId);

    if (cart.status !== CARTS.STATUS.ACTIVE) {
      throw new BadRequestException(BUSINESS_ERROR_MESSAGES.CART_NOT_ACTIVE);
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException(BUSINESS_ERROR_MESSAGES.CART_ITEM_NOT_FOUND);
    }

    this.logger.info("Removing item from cart", LOGGING.CATEGORIES.API, {
      cartId,
      itemId,
    });

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async remove(id: string) {
    await this.findById(id);

    this.logger.info(`Deleting cart ${id}`, LOGGING.CATEGORIES.API);

    return this.prisma.cart.delete({
      where: { id },
    });
  }
}

import { Injectable } from "@nestjs/common";
import { CartRepository } from "../../application/ports/cart.repository";
import { Cart, CartItem } from "../../core/entities/cart.entity";
import { PrismaAdapter } from "../adapters/prisma.adapter";
import { LoggerProvider } from "../logging/logger.provider";
import { BaseRepository } from "./base.repository";
import { CARTS } from "../../shared/constants/domains/carts.constants";
import { LOGGING } from "../../shared/constants/logging.constants";

@Injectable()
export class CartPrismaRepository
  extends BaseRepository
  implements CartRepository
{
  private static readonly CART_INCLUDE = {
    items: {
      include: { product: true },
      orderBy: { createdAt: "asc" as const },
    },
  };

  constructor(
    private readonly prisma: PrismaAdapter,
    logger: LoggerProvider,
  ) {
    super(logger);
  }

  async create(userId: string): Promise<Cart> {
    return this.loggedOperation(
      "Creating cart",
      LOGGING.CATEGORIES.API,
      { userId },
      async () => {
        const cart = await this.prisma.cart.create({
          data: { userId, status: CARTS.STATUS.ACTIVE },
          include: CartPrismaRepository.CART_INCLUDE,
        });
        return this.toDomainCart(cart);
      },
    );
  }

  async findById(id: string): Promise<Cart | null> {
    return this.loggedOperation(
      "Fetching cart",
      LOGGING.CATEGORIES.API,
      { id },
      async () => {
        const cart = await this.prisma.cart.findUnique({
          where: { id },
          include: CartPrismaRepository.CART_INCLUDE,
        });
        return cart ? this.toDomainCart(cart) : null;
      },
    );
  }

  async remove(id: string): Promise<Cart> {
    return this.loggedOperation(
      "Deleting cart",
      LOGGING.CATEGORIES.API,
      { id },
      async () => {
        const cart = await this.prisma.cart.delete({
          where: { id },
          include: CartPrismaRepository.CART_INCLUDE,
        });
        return this.toDomainCart(cart);
      },
    );
  }

  async findCartItem(
    cartId: string,
    productId: string,
  ): Promise<CartItem | null> {
    const item = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId, productId } },
      include: { product: true },
    });
    return item ? this.toDomainCartItem(item) : null;
  }

  async createCartItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItem> {
    return this.loggedOperation(
      "Adding item to cart",
      LOGGING.CATEGORIES.API,
      { cartId, productId, quantity },
      async () => {
        const item = await this.prisma.cartItem.create({
          data: { cartId, productId, quantity },
          include: { product: true },
        });
        return this.toDomainCartItem(item);
      },
    );
  }

  async updateCartItemQuantity(
    itemId: string,
    quantity: number,
  ): Promise<CartItem> {
    return this.loggedOperation(
      "Updating cart item quantity",
      LOGGING.CATEGORIES.API,
      { itemId, quantity },
      async () => {
        const item = await this.prisma.cartItem.update({
          where: { id: itemId },
          data: { quantity },
          include: { product: true },
        });
        return this.toDomainCartItem(item);
      },
    );
  }

  async removeCartItem(itemId: string): Promise<CartItem> {
    return this.loggedOperation(
      "Removing item from cart",
      LOGGING.CATEGORIES.API,
      { itemId },
      async () => {
        const item = await this.prisma.cartItem.delete({
          where: { id: itemId },
          include: { product: true },
        });
        return this.toDomainCartItem(item);
      },
    );
  }

  private toDomainCart(prismaCart: any): Cart {
    return {
      id: prismaCart.id,
      userId: prismaCart.userId,
      status: prismaCart.status,
      items: (prismaCart.items || []).map((item: any) =>
        this.toDomainCartItem(item),
      ),
      createdAt: prismaCart.createdAt,
      updatedAt: prismaCart.updatedAt,
    };
  }

  private toDomainCartItem(prismaItem: any): CartItem {
    return {
      id: prismaItem.id,
      cartId: prismaItem.cartId,
      productId: prismaItem.productId,
      quantity: prismaItem.quantity,
      product: prismaItem.product
        ? {
            id: prismaItem.product.id,
            name: prismaItem.product.name,
            description: prismaItem.product.description,
            price: Number(prismaItem.product.price),
            stock: prismaItem.product.stock,
            createdAt: prismaItem.product.createdAt,
            updatedAt: prismaItem.product.updatedAt,
          }
        : undefined,
      createdAt: prismaItem.createdAt,
      updatedAt: prismaItem.updatedAt,
    };
  }
}

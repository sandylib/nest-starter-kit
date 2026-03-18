import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CART_REPOSITORY, PRODUCT_REPOSITORY } from "../ports/injection-tokens";
import { CartRepository } from "../ports/cart.repository";
import { ProductRepository } from "../ports/product.repository";
import { Cart, CartItem } from "../../core/entities/cart.entity";
import { BUSINESS_ERROR_MESSAGES } from "../../shared/constants/errors/business-errors.constants";
import { CARTS } from "../../shared/constants/domains/carts.constants";

@Injectable()
export class CartsService {
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async create(userId: string): Promise<Cart> {
    return this.cartRepository.create(userId);
  }

  async findById(id: string): Promise<Cart> {
    const cart = await this.cartRepository.findById(id);

    if (!cart) {
      throw new NotFoundException(BUSINESS_ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    return cart;
  }

  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItem> {
    const cart = await this.findById(cartId);

    if (cart.status !== CARTS.STATUS.ACTIVE) {
      throw new BadRequestException(BUSINESS_ERROR_MESSAGES.CART_NOT_ACTIVE);
    }

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException(BUSINESS_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (product.stock < quantity) {
      throw new BadRequestException(BUSINESS_ERROR_MESSAGES.INSUFFICIENT_STOCK);
    }

    const existingItem = await this.cartRepository.findCartItem(
      cartId,
      productId,
    );

    if (existingItem) {
      return this.cartRepository.updateCartItemQuantity(
        existingItem.id,
        existingItem.quantity + quantity,
      );
    }

    return this.cartRepository.createCartItem(cartId, productId, quantity);
  }

  async removeItem(cartId: string, itemId: string): Promise<CartItem> {
    const cart = await this.findById(cartId);

    if (cart.status !== CARTS.STATUS.ACTIVE) {
      throw new BadRequestException(BUSINESS_ERROR_MESSAGES.CART_NOT_ACTIVE);
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException(BUSINESS_ERROR_MESSAGES.CART_ITEM_NOT_FOUND);
    }

    return this.cartRepository.removeCartItem(itemId);
  }

  async remove(id: string): Promise<Cart> {
    await this.findById(id);
    return this.cartRepository.remove(id);
  }
}

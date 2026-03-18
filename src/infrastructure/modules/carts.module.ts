import { Module } from "@nestjs/common";
import { PrismaAdapter } from "../adapters/prisma.adapter";
import { CartsService } from "../../application/use-cases/carts.service";
import { CartsController } from "../../presentation/web/controllers/carts/carts.controller";
import { CART_REPOSITORY } from "../../application/ports/injection-tokens";
import { PRODUCT_REPOSITORY } from "../../application/ports/injection-tokens";
import { CartPrismaRepository } from "../repositories/cart-prisma.repository";
import { ProductPrismaRepository } from "../repositories/product-prisma.repository";

@Module({
  controllers: [CartsController],
  providers: [
    CartsService,
    PrismaAdapter,
    { provide: CART_REPOSITORY, useClass: CartPrismaRepository },
    { provide: PRODUCT_REPOSITORY, useClass: ProductPrismaRepository },
  ],
  exports: [CartsService],
})
export class CartsModule {}

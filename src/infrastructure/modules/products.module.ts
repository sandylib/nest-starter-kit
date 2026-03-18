import { Module } from "@nestjs/common";
import { PrismaAdapter } from "../adapters/prisma.adapter";
import { ProductsService } from "../../application/use-cases/products.service";
import { ProductsController } from "../../presentation/web/controllers/products/products.controller";
import { PRODUCT_REPOSITORY } from "../../application/ports/injection-tokens";
import { ProductPrismaRepository } from "../repositories/product-prisma.repository";

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    PrismaAdapter,
    { provide: PRODUCT_REPOSITORY, useClass: ProductPrismaRepository },
  ],
  exports: [ProductsService],
})
export class ProductsModule {}

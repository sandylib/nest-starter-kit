import { Module } from "@nestjs/common";
import { PrismaAdapter } from "../adapters/prisma.adapter";
import { ProductsService } from "../../application/use-cases/products.service";
import { ProductsController } from "../../presentation/web/controllers/products/products.controller";

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaAdapter],
  exports: [ProductsService],
})
export class ProductsModule {}

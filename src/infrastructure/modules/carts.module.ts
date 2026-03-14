import { Module } from "@nestjs/common";
import { PrismaAdapter } from "../adapters/prisma.adapter";
import { CartsService } from "../../application/use-cases/carts.service";
import { CartsController } from "../../presentation/web/controllers/carts/carts.controller";

@Module({
  controllers: [CartsController],
  providers: [CartsService, PrismaAdapter],
  exports: [CartsService],
})
export class CartsModule {}

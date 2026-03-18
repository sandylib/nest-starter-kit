import { Injectable } from "@nestjs/common";
import { ProductRepository } from "../../application/ports/product.repository";
import { Product } from "../../core/entities/product.entity";
import { PrismaAdapter } from "../adapters/prisma.adapter";
import { LoggerProvider } from "../logging/logger.provider";
import { BaseRepository } from "./base.repository";
import { LOGGING } from "../../shared/constants/logging.constants";

@Injectable()
export class ProductPrismaRepository
  extends BaseRepository
  implements ProductRepository
{
  constructor(
    private readonly prisma: PrismaAdapter,
    logger: LoggerProvider,
  ) {
    super(logger);
  }

  async findAll(): Promise<Product[]> {
    return this.loggedOperation(
      "Fetching all products",
      LOGGING.CATEGORIES.API,
      {},
      async () => {
        const products = await this.prisma.product.findMany({
          orderBy: { createdAt: "desc" },
        });
        return products.map(this.toDomain);
      },
    );
  }

  async findById(id: string): Promise<Product | null> {
    return this.loggedOperation(
      "Fetching product",
      LOGGING.CATEGORIES.API,
      { id },
      async () => {
        const product = await this.prisma.product.findUnique({
          where: { id },
        });
        return product ? this.toDomain(product) : null;
      },
    );
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
  }): Promise<Product> {
    return this.loggedOperation(
      "Creating product",
      LOGGING.CATEGORIES.API,
      { name: data.name },
      async () => {
        const product = await this.prisma.product.create({
          data: {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock ?? 0,
          },
        });
        return this.toDomain(product);
      },
    );
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
    },
  ): Promise<Product> {
    return this.loggedOperation(
      "Updating product",
      LOGGING.CATEGORIES.API,
      { id },
      async () => {
        const product = await this.prisma.product.update({
          where: { id },
          data,
        });
        return this.toDomain(product);
      },
    );
  }

  async remove(id: string): Promise<Product> {
    return this.loggedOperation(
      "Deleting product",
      LOGGING.CATEGORIES.API,
      { id },
      async () => {
        const product = await this.prisma.product.delete({
          where: { id },
        });
        return this.toDomain(product);
      },
    );
  }

  private toDomain(prismaProduct: any): Product {
    return {
      id: prismaProduct.id,
      name: prismaProduct.name,
      description: prismaProduct.description,
      price: Number(prismaProduct.price),
      stock: prismaProduct.stock,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    };
  }
}

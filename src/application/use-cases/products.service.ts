import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaAdapter } from "../../infrastructure/adapters/prisma.adapter";
import { LoggerProvider } from "../../infrastructure/logging/logger.provider";
import { BUSINESS_ERROR_MESSAGES } from "../../shared/constants/errors/business-errors.constants";
import { LOGGING } from "../../shared/constants/logging.constants";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaAdapter,
    private readonly logger: LoggerProvider,
  ) {}

  async findAll() {
    this.logger.info("Fetching all products", LOGGING.CATEGORIES.API);
    return this.prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    this.logger.info(`Fetching product ${id}`, LOGGING.CATEGORIES.API);

    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(BUSINESS_ERROR_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return product;
  }

  async create(data: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
  }) {
    this.logger.info("Creating product", LOGGING.CATEGORIES.API, {
      name: data.name,
    });

    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock ?? 0,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
    },
  ) {
    await this.findById(id);

    this.logger.info(`Updating product ${id}`, LOGGING.CATEGORIES.API);

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findById(id);

    this.logger.info(`Deleting product ${id}`, LOGGING.CATEGORIES.API);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}

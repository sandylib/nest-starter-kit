import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PRODUCT_REPOSITORY } from "../ports/injection-tokens";
import { ProductRepository } from "../ports/product.repository";
import { Product } from "../../core/entities/product.entity";
import { BUSINESS_ERROR_MESSAGES } from "../../shared/constants/errors/business-errors.constants";

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);

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
  }): Promise<Product> {
    return this.productRepository.create(data);
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
    await this.findById(id);
    return this.productRepository.update(id, data);
  }

  async remove(id: string): Promise<Product> {
    await this.findById(id);
    return this.productRepository.remove(id);
  }
}

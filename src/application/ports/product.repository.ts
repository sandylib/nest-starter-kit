import { Product } from "../../core/entities/product.entity";

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(data: {
    name: string;
    description?: string;
    price: number;
    stock?: number;
  }): Promise<Product>;
  update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
    },
  ): Promise<Product>;
  remove(id: string): Promise<Product>;
}

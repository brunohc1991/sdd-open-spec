import { PageResult } from "@sdd/shared";
import { Product, ProductPageParams, ProductRepository } from "../../src";

export class FakeProductRepository implements ProductRepository {
  private readonly storage = new Map<string, Product>();

  get products(): Product[] {
    return [...this.storage.values()];
  }

  async create(product: Product): Promise<Product> {
    this.storage.set(product.id, product);

    return product;
  }

  async update(product: Product): Promise<Product> {
    if (!this.storage.has(product.id)) {
      throw new Error(`Product ${product.id} not found`);
    }

    this.storage.set(product.id, product);

    return product;
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }

  async findById(id: string): Promise<Product | null> {
    return this.storage.get(id) ?? null;
  }

  async findPage(params: ProductPageParams): Promise<PageResult<Product>> {
    const start = (params.page - 1) * params.perPage;

    return {
      items: this.products.slice(start, start + params.perPage),
      page: params.page,
      perPage: params.perPage,
      total: this.storage.size,
    };
  }
}

import { UseCase } from "@sdd/shared";
import { Product, ProductStatus } from "../model";
import { ProductRepository } from "../provider";

export interface SaveProductIn {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  status: ProductStatus;
  availableOnline?: boolean;
  featured?: boolean;
  allowsPreOrder?: boolean;
}

export class SaveProduct implements UseCase<SaveProductIn, void> {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(input: SaveProductIn): Promise<void> {
    const existing = input.id
      ? await this.productRepository.findById(input.id)
      : null;
    const data = {
      name: input.name,
      description: input.description,
      price: input.price,
      status: input.status,
      availableOnline: input.availableOnline,
      featured: input.featured,
      allowsPreOrder: input.allowsPreOrder,
    };

    if (existing) {
      const updated = existing.clone(data);

      updated.validate();
      await this.productRepository.update(updated);
      return;
    }

    const created = new Product({ id: input.id, ...data });

    created.validate();
    await this.productRepository.create(created);
  }
}

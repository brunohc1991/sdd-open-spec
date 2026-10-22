import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { DeleteProduct, Product, SaveProduct } from '@sdd/catalog';
import type { ProductStatus, SaveProductIn } from '@sdd/catalog';
import { DomainError, PageResult } from '@sdd/shared';
import { PrismaProductRepository } from './product.prisma';

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;

interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  availableOnline: boolean;
  featured: boolean;
  allowsPreOrder: boolean;
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function toProductResponse(product: Product): ProductResponse {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    status: product.status,
    availableOnline: product.availableOnline,
    featured: product.featured,
    allowsPreOrder: product.allowsPreOrder,
  };
}

function toSaveProductIn(input: SaveProductIn, id?: string): SaveProductIn {
  return {
    id,
    name: input?.name,
    description: input?.description,
    price: input?.price,
    status: input?.status,
    availableOnline: input?.availableOnline,
    featured: input?.featured,
    allowsPreOrder: input?.allowsPreOrder,
  };
}

@Controller('products')
export class ProductController {
  constructor(private readonly productRepository: PrismaProductRepository) {}

  @Get()
  async findPage(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ): Promise<PageResult<ProductResponse>> {
    const result = await this.productRepository.findPage({
      page: toPositiveInt(page, DEFAULT_PAGE),
      perPage: toPositiveInt(perPage, DEFAULT_PER_PAGE),
    });

    return { ...result, items: result.items.map(toProductResponse) };
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new DomainError('product.not_found', 404);
    }

    return toProductResponse(product);
  }

  @Post()
  async create(@Body() input: SaveProductIn): Promise<void> {
    const saveProduct = new SaveProduct(this.productRepository);

    await saveProduct.execute(toSaveProductIn(input));
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() input: SaveProductIn,
  ): Promise<void> {
    const saveProduct = new SaveProduct(this.productRepository);

    await saveProduct.execute(toSaveProductIn(input, id));
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    const deleteProduct = new DeleteProduct(this.productRepository);

    await deleteProduct.execute({ id });
  }
}

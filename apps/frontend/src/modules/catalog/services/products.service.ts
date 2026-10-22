import { apiRequest as request } from '@/modules/auth/util/api-request.util';

export const PRODUCT_STATUSES = ['active', 'inactive', 'draft'] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface ProductSummary {
  id: string;
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  availableOnline: boolean;
  featured: boolean;
  allowsPreOrder: boolean;
}

export interface ProductPage {
  items: ProductSummary[];
  page: number;
  perPage: number;
  total: number;
}

export interface ProductFormData {
  name: string;
  description: string | null;
  price: number;
  status: ProductStatus;
  availableOnline: boolean;
  featured: boolean;
  allowsPreOrder: boolean;
}

export function listProducts(token: string | null, page: number, perPage: number): Promise<ProductPage> {
  return request<ProductPage>(`/products?page=${page}&perPage=${perPage}`, token);
}

export function getProduct(token: string | null, id: string): Promise<ProductSummary> {
  return request<ProductSummary>(`/products/${encodeURIComponent(id)}`, token);
}

export function createProduct(token: string | null, data: ProductFormData): Promise<void> {
  return request<void>('/products', token, { method: 'POST', body: JSON.stringify(data) });
}

export function updateProduct(token: string | null, id: string, data: ProductFormData): Promise<void> {
  return request<void>(`/products/${encodeURIComponent(id)}`, token, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteProduct(token: string | null, id: string): Promise<void> {
  return request<void>(`/products/${encodeURIComponent(id)}`, token, { method: 'DELETE' });
}

'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { getCurrentLocale, getMessage } from '@/shared/i18n';
import type { ProductSummary } from '../services/products.service';

type ProductsTableProps = {
  products: ProductSummary[];
  loading?: boolean;
  onDelete: (product: ProductSummary) => void;
};

function formatPrice(price: number): string {
  const locale = getCurrentLocale() === 'en' ? 'en-US' : 'pt-BR';

  return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ProductsTableComponent({ products, loading = false, onDelete }: ProductsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-5">Nome</TableHead>
          <TableHead className="text-right">Preço</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-28 px-5 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
              {loading ? 'Carregando produtos...' : 'Nenhum produto encontrado.'}
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="px-5 font-medium">{product.name}</TableCell>
              <TableCell className="text-right tabular-nums">{formatPrice(product.price)}</TableCell>
              <TableCell>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {getMessage(`product.status.${product.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="px-5">
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" aria-label={`Editar ${product.name}`}>
                    <Link href={`/products/${product.id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${product.name}`}
                    onClick={() => onDelete(product)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

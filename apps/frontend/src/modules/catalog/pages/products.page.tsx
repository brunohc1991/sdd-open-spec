'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth';
import { ApiRequestError, notifyApiError } from '@/modules/auth/util/api-error.util';
import { Button } from '@/shared/components/ui/button';
import { DeleteConfirmationDialog } from '@/shared/components/ui/delete-confirmation-dialog';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { PaginationControls } from '@/shared/components/ui/pagination-controls';
import { TableCard } from '@/shared/components/ui/table-card';
import { ProductsTableComponent } from '../components/products-table.component';
import {
  deleteProduct,
  listProducts,
  type ProductPage,
  type ProductSummary,
} from '../services/products.service';

const PER_PAGE = 10;

export default function ProductsPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState<ProductPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<ProductSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setLoading(true);

    listProducts(token, page, PER_PAGE)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((error) => {
        if (!cancelled) notifyApiError(error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, page, reloadKey]);

  async function handleConfirmDelete() {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      await deleteProduct(token, productToDelete.id);
      toast.success('Produto excluído com sucesso.');
    } catch (error) {
      notifyApiError(error);
      if (!(error instanceof ApiRequestError && error.status === 404)) {
        setDeleting(false);
        return;
      }
    }

    const wasLastItemOfPage = data?.items.length === 1 && page > 1;

    setProductToDelete(null);
    setDeleting(false);
    if (wasLastItemOfPage) {
      setPage(page - 1);
    } else {
      setReloadKey((key) => key + 1);
    }
  }

  const products = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PER_PAGE));

  return (
    <div className="space-y-6">
      <PageSectionHeader
        badge="Produtos"
        title="Produtos"
        subtitle="Gerencie os produtos do catálogo."
        aside={
          <Button asChild>
            <Link href="/products/new">
              <Plus className="size-4" />
              Novo produto
            </Link>
          </Button>
        }
      />

      <TableCard
        footer={
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalItems={data?.total}
            totalLabel="produtos"
            onPageChange={setPage}
            disabled={loading}
          />
        }
      >
        <ProductsTableComponent products={products} loading={loading} onDelete={setProductToDelete} />
      </TableCard>

      <DeleteConfirmationDialog
        key={productToDelete?.id ?? 'closed'}
        open={productToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir produto"
        description="Esta ação remove o produto de forma permanente."
        itemLabel="Produto"
        itemValue={productToDelete?.name}
        isConfirming={deleting}
      />
    </div>
  );
}

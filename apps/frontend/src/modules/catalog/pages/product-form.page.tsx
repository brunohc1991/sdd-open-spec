'use client';

import { useParams } from 'next/navigation';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { ProductFormComponent } from '../components/product-form.component';

export default function ProductFormPage() {
  const params = useParams<{ id?: string }>();
  const productId = params.id;
  const isEditing = productId !== undefined;

  return (
    <div className="space-y-8">
      <PageSectionHeader
        badge="Produtos"
        title={isEditing ? 'Editar produto' : 'Novo produto'}
        subtitle={
          isEditing
            ? 'Atualize os dados do produto.'
            : 'Cadastre um novo produto no catálogo.'
        }
      />
      <ProductFormComponent productId={productId} />
    </div>
  );
}

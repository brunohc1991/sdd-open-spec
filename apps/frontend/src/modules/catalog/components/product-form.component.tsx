'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth';
import { notifyApiError } from '@/modules/auth/util/api-error.util';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { FormSectionLayout } from '@/shared/components/ui/form-section-layout';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { getMessage } from '@/shared/i18n';
import {
  createProduct,
  getProduct,
  PRODUCT_STATUSES,
  updateProduct,
  type ProductStatus,
} from '../services/products.service';

const PRODUCTS_ROUTE = '/products';

const SELECT_CLASS_NAME =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

type ProductFormProps = {
  productId?: string;
};

function parsePrice(value: string): number {
  return Number(value.trim().replace(',', '.'));
}

export function ProductFormComponent({ productId }: ProductFormProps) {
  const isEditing = productId !== undefined;
  const { token } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<ProductStatus>('draft');
  const [availableOnline, setAvailableOnline] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [allowsPreOrder, setAllowsPreOrder] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing || !token) return;

    let cancelled = false;

    getProduct(token, productId)
      .then((product) => {
        if (cancelled) return;
        setName(product.name);
        setDescription(product.description ?? '');
        setPrice(String(product.price));
        setStatus(product.status);
        setAvailableOnline(product.availableOnline);
        setFeatured(product.featured);
        setAllowsPreOrder(product.allowsPreOrder);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        notifyApiError(error);
        router.replace(PRODUCTS_ROUTE);
      });

    return () => {
      cancelled = true;
    };
  }, [isEditing, productId, token, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = {
      name,
      description: description === '' ? null : description,
      price: parsePrice(price),
      status,
      availableOnline,
      featured,
      allowsPreOrder,
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateProduct(token, productId, data);
        toast.success('Produto atualizado com sucesso.');
      } else {
        await createProduct(token, data);
        toast.success('Produto criado com sucesso.');
      }
      router.push(PRODUCTS_ROUTE);
    } catch (error) {
      notifyApiError(error);
      setSubmitting(false);
    }
  }

  const disabled = loading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <FormSectionLayout title="Dados básicos" description="Nome e descrição do produto.">
        <div>
          <Label htmlFor="product-name">Nome</Label>
          <Input
            id="product-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            disabled={disabled}
          />
        </div>
        <div>
          <Label htmlFor="product-description">Descrição</Label>
          <Textarea
            id="product-description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={disabled}
          />
        </div>
      </FormSectionLayout>

      <FormSectionLayout title="Preço e status" description="Valor de venda (até 2 casas decimais) e situação do produto.">
        <div>
          <Label htmlFor="product-price">Preço</Label>
          <Input
            id="product-price"
            name="price"
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            disabled={disabled}
          />
        </div>
        <div>
          <Label htmlFor="product-status">Status</Label>
          <select
            id="product-status"
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ProductStatus)}
            required
            disabled={disabled}
            className={SELECT_CLASS_NAME}
          >
            {PRODUCT_STATUSES.map((option) => (
              <option key={option} value={option}>
                {getMessage(`product.status.${option}`)}
              </option>
            ))}
          </select>
        </div>
      </FormSectionLayout>

      <FormSectionLayout
        title="Disponibilidade"
        description="Onde e como o produto pode ser oferecido."
        showDivider={false}
      >
        <div className="flex items-center gap-3">
          <Checkbox
            id="product-available-online"
            checked={availableOnline}
            onCheckedChange={(checked) => setAvailableOnline(checked === true)}
            disabled={disabled}
          />
          <Label htmlFor="product-available-online">Disponível online</Label>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="product-featured"
            checked={featured}
            onCheckedChange={(checked) => setFeatured(checked === true)}
            disabled={disabled}
          />
          <Label htmlFor="product-featured">Destaque</Label>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox
            id="product-allows-pre-order"
            checked={allowsPreOrder}
            onCheckedChange={(checked) => setAllowsPreOrder(checked === true)}
            disabled={disabled}
          />
          <Label htmlFor="product-allows-pre-order">Permite pré-venda</Label>
        </div>
      </FormSectionLayout>

      <div className="flex justify-end gap-3">
        <Button asChild type="button" variant="secondary">
          <Link href={PRODUCTS_ROUTE}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={disabled}>
          {isEditing ? 'Salvar alterações' : 'Criar produto'}
        </Button>
      </div>
    </form>
  );
}

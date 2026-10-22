'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { DeleteConfirmationDialog } from '@/shared/components/ui/delete-confirmation-dialog';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { PaginationControls } from '@/shared/components/ui/pagination-controls';
import { TableCard } from '@/shared/components/ui/table-card';
import { UsersTableComponent } from '../components/users-table.component';
import { useAuth } from '../context/auth.context';
import { deleteUser, listUsers, type UserPage, type UserSummary } from '../services/users.service';
import { ApiRequestError, notifyApiError } from '../util/api-error.util';

const PER_PAGE = 10;

export default function UsersPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [data, setData] = useState<UserPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<UserSummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setLoading(true);

    listUsers(token, page, PER_PAGE)
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
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await deleteUser(token, userToDelete.id);
      toast.success('Usuário excluído com sucesso.');
    } catch (error) {
      notifyApiError(error);
      if (!(error instanceof ApiRequestError && error.status === 404)) {
        setDeleting(false);
        return;
      }
    }

    const wasLastItemOfPage = data?.items.length === 1 && page > 1;

    setUserToDelete(null);
    setDeleting(false);
    if (wasLastItemOfPage) {
      setPage(page - 1);
    } else {
      setReloadKey((key) => key + 1);
    }
  }

  const users = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PER_PAGE));

  return (
    <div className="space-y-6">
      <PageSectionHeader
        badge="Usuários"
        title="Usuários"
        subtitle="Gerencie quem tem acesso à aplicação."
        aside={
          <Button asChild>
            <Link href="/users/new">
              <Plus className="size-4" />
              Novo usuário
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
            totalLabel="usuários"
            onPageChange={setPage}
            disabled={loading}
          />
        }
      >
        <UsersTableComponent users={users} loading={loading} onDelete={setUserToDelete} />
      </TableCard>

      <DeleteConfirmationDialog
        key={userToDelete?.id ?? 'closed'}
        open={userToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir usuário"
        description="Esta ação remove o usuário de forma permanente."
        itemLabel="Usuário"
        itemValue={userToDelete?.name}
        isConfirming={deleting}
      />
    </div>
  );
}

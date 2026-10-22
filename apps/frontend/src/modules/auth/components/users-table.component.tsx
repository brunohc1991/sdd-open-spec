'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import type { UserSummary } from '../services/users.service';

type UsersTableProps = {
  users: UserSummary[];
  loading?: boolean;
  onDelete: (user: UserSummary) => void;
};

export function UsersTableComponent({ users, loading = false, onDelete }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-5">Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead className="w-28 px-5 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="px-5 py-10 text-center text-muted-foreground">
              {loading ? 'Carregando usuários...' : 'Nenhum usuário encontrado.'}
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="px-5 font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell className="px-5">
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" aria-label={`Editar ${user.name}`}>
                    <Link href={`/users/${user.id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir ${user.name}`}
                    onClick={() => onDelete(user)}
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

'use client';

import { useParams } from 'next/navigation';
import { PageSectionHeader } from '@/shared/components/ui/page-section-header';
import { UserFormComponent } from '../components/user-form.component';

export default function UserFormPage() {
  const params = useParams<{ id?: string }>();
  const userId = params.id;
  const isEditing = userId !== undefined;

  return (
    <div className="space-y-8">
      <PageSectionHeader
        badge="Usuários"
        title={isEditing ? 'Editar usuário' : 'Novo usuário'}
        subtitle={
          isEditing
            ? 'Atualize os dados do usuário.'
            : 'Cadastre um novo usuário com acesso à aplicação.'
        }
      />
      <UserFormComponent userId={userId} />
    </div>
  );
}

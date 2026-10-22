'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { FormErrorMessage } from '@/shared/components/ui/form-error-message';
import { FormSectionLayout } from '@/shared/components/ui/form-section-layout';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getMessage } from '@/shared/i18n';
import { useAuth } from '../context/auth.context';
import { createUser, getUser, updateUser } from '../services/users.service';
import { notifyApiError } from '../util/api-error.util';

const USERS_ROUTE = '/users';

type UserFormProps = {
  userId?: string;
};

export function UserFormComponent({ userId }: UserFormProps) {
  const isEditing = userId !== undefined;
  const { token } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing || !token) return;

    let cancelled = false;

    getUser(token, userId)
      .then((user) => {
        if (cancelled) return;
        setName(user.name);
        setEmail(user.email);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) return;
        notifyApiError(error);
        router.replace(USERS_ROUTE);
      });

    return () => {
      cancelled = true;
    };
  }, [isEditing, userId, token, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmation) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);

    const data = { name, email, ...(password ? { password } : {}) };

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateUser(token, userId, data);
        toast.success('Usuário atualizado com sucesso.');
      } else {
        await createUser(token, data);
        toast.success('Usuário criado com sucesso.');
      }
      router.push(USERS_ROUTE);
    } catch (error) {
      notifyApiError(error);
      setSubmitting(false);
    }
  }

  const disabled = loading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <FormSectionLayout title="Dados básicos" description="Nome completo e e-mail do usuário.">
        <div>
          <Label htmlFor="user-name">Nome</Label>
          <Input
            id="user-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            disabled={disabled}
          />
        </div>
        <div>
          <Label htmlFor="user-email">E-mail</Label>
          <Input
            id="user-email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={disabled}
          />
        </div>
      </FormSectionLayout>

      <FormSectionLayout
        title="Senha"
        description={
          isEditing
            ? 'Deixe em branco para manter a senha atual.'
            : 'Defina a senha de acesso do usuário.'
        }
        showDivider={false}
      >
        <div>
          <Label htmlFor="user-password">Senha</Label>
          <Input
            id="user-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required={!isEditing}
            disabled={disabled}
          />
        </div>
        <div>
          <Label htmlFor="user-password-confirmation">Confirmação da senha</Label>
          <Input
            id="user-password-confirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required={!isEditing}
            disabled={disabled}
            aria-invalid={passwordMismatch}
          />
          {passwordMismatch ? (
            <FormErrorMessage className="mt-1.5">{getMessage('user.password.mismatch')}</FormErrorMessage>
          ) : null}
        </div>
      </FormSectionLayout>

      <div className="flex justify-end gap-3">
        <Button asChild type="button" variant="secondary">
          <Link href={USERS_ROUTE}>Cancelar</Link>
        </Button>
        <Button type="submit" disabled={disabled}>
          {isEditing ? 'Salvar alterações' : 'Criar usuário'}
        </Button>
      </div>
    </form>
  );
}

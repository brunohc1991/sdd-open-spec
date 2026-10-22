'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getMessage } from '@/shared/i18n';
import { useAuth } from '../context/auth.context';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AFTER_LOGIN_ROUTE = '/example/dashboard';

export default function AuthComponent() {
  const auth = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.get('email'),
          password: data.get('password'),
        }),
      });
      const body = await response.json().catch(() => null);

      if (response.ok && typeof body?.token === 'string') {
        auth.login(body.token);
        router.push(AFTER_LOGIN_ROUTE);
        return;
      }

      const errors: unknown[] = Array.isArray(body?.errors) ? body.errors : [];
      const codes = errors.filter((code): code is string => typeof code === 'string');

      if (codes.length === 0) {
        toast.error(getMessage('DEFAULT_API_ERROR'));
        return;
      }

      codes.forEach((code) => toast.error(getMessage(code)));
    } catch {
      toast.error(getMessage('DEFAULT_API_ERROR'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div>
        <Label htmlFor="login-email">E-mail</Label>
        <Input
          id="login-email"
          name="email"
          required
          className="border-white/10 bg-white/5 text-white"
        />
      </div>
      <div>
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          name="password"
          type="password"
          required
          className="border-white/10 bg-white/5 text-white"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full bg-amber-400 font-bold text-black hover:bg-amber-300"
      >
        Entrar
      </Button>
    </form>
  );
}

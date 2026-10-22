'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getMessage } from '@/shared/i18n';
import { useAuth } from '@/modules/auth';
import AuthComponent from '@/modules/auth/components/auth.component';

type Mode = 'register' | 'login';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTHENTICATED_ROUTE = '/example/dashboard';

function RegisterForm() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          password: data.get('password'),
        }),
      });

      if (response.status === 201) {
        toast.success('Cadastro realizado com sucesso!');
        form.reset();
        return;
      }

      const body = await response.json().catch(() => null);
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
        <Label htmlFor="register-name">Nome</Label>
        <Input
          id="register-name"
          name="name"
          required
          className="border-white/10 bg-white/5 text-white"
        />
      </div>
      <div>
        <Label htmlFor="register-email">E-mail</Label>
        <Input
          id="register-email"
          name="email"
          required
          className="border-white/10 bg-white/5 text-white"
        />
      </div>
      <div>
        <Label htmlFor="register-password">Senha</Label>
        <Input
          id="register-password"
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
        Cadastrar
      </Button>
    </form>
  );
}

export default function JoinPage() {
  const [mode, setMode] = useState<Mode>('register');
  const isRegister = mode === 'register';
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(AUTHENTICATED_ROUTE);
    }
  }, [status, router]);

  if (status !== 'unauthenticated') {
    return <div className="min-h-screen bg-black" aria-busy="true" />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
            <Layers className="size-7 text-amber-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight">Aplicação</h1>
            <p className="mt-1 text-sm text-white/50">
              {isRegister
                ? 'Crie sua conta para continuar'
                : 'Entre na sua conta para continuar'}
            </p>
          </div>
        </div>

        {isRegister ? <RegisterForm /> : <AuthComponent />}

        <button
          type="button"
          onClick={() => setMode(isRegister ? 'login' : 'register')}
          className="text-sm text-amber-400 transition-colors hover:text-amber-300"
        >
          {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastre-se'}
        </button>

        <Link
          href="/"
          className="text-xs text-white/30 transition-colors hover:text-white/60"
        >
          ← Voltar para o início
        </Link>
      </div>
    </div>
  );
}

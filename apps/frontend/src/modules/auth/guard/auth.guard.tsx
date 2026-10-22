'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/auth.context';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/join');
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return <div className="min-h-screen bg-black" aria-busy="true" />;
  }

  return <>{children}</>;
}

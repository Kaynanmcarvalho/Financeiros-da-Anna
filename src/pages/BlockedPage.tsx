import { Navigate } from 'react-router-dom';
import { LockKeyhole, LogOut } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { signOut } from '@/firebase/auth';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/PageLoader';

export default function BlockedPage() {
  const { user, userProfile, loading } = useAuth();

  if (loading || (user && !userProfile)) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!userProfile?.blocked) return <Navigate to="/" replace />;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--color-bg)] p-4">
      <section className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[var(--color-danger)]/20 bg-[var(--surface-raised)] p-6 text-center shadow-[var(--shadow-raised)] sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--color-danger)]/10 blur-3xl" />
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
          <LockKeyhole size={30} />
        </div>
        <span className="relative mt-5 block text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--color-danger)]">Acesso suspenso</span>
        <h1 className="relative mt-1 text-2xl font-extrabold text-[var(--color-text)]">Sua conta está bloqueada</h1>
        <p className="relative mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          O acesso ao aplicativo foi temporariamente suspenso. Entre em contato com a administração para mais informações.
        </p>
        <div className="relative mt-6">
          <Button variant="outline" fullWidth icon={<LogOut size={17} />} onClick={() => void signOut()}>
            Sair da conta
          </Button>
        </div>
      </section>
    </main>
  );
}

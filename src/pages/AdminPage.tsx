import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Activity,
  ArrowLeft,
  Ban,
  Crown,
  Search,
  ShieldCheck,
  UnlockKeyhole,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useAdminUsers, useAdminVisits, useToggleUserBlocked, type VisitPeriod } from '@/hooks/useAdmin';
import { useUIStore } from '@/stores/uiStore';
import type { UserProfile } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SkeletonList } from '@/components/ui/Skeleton';

const periodOptions: { value: VisitPeriod; label: string }[] = [
  { value: 'day', label: 'Hoje' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
];

function formatCreatedAt(user: UserProfile) {
  const date = user.createdAt?.toDate?.();
  return date ? format(date, "dd 'de' MMM 'de' yyyy", { locale: ptBR }) : 'Data não disponível';
}

export default function AdminPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<VisitPeriod>('day');
  const [search, setSearch] = useState('');
  const usersQuery = useAdminUsers();
  const visitsQuery = useAdminVisits(period);
  const toggleBlocked = useToggleUserBlocked();
  const openConfirmDialog = useUIStore((state) => state.openConfirmDialog);
  const usersList = usersQuery.data ?? [];
  const visits = visitsQuery.data ?? [];
  const visitCounts = new Map<string, number>();
  visits.forEach((visit) => visitCounts.set(visit.uid, (visitCounts.get(visit.uid) ?? 0) + 1));

  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');
  const filteredUsers = normalizedSearch
    ? usersList.filter((item) =>
        item.name.toLocaleLowerCase('pt-BR').includes(normalizedSearch) ||
        item.email.toLocaleLowerCase('pt-BR').includes(normalizedSearch)
      )
    : usersList;

  const blockedUsers = usersList.filter((item) => item.blocked).length;
  const uniqueVisitors = new Set(visits.map((visit) => visit.uid)).size;

  const handleToggleBlocked = (target: UserProfile) => {
    const shouldBlock = !target.blocked;
    openConfirmDialog({
      title: shouldBlock ? 'Bloquear usuário?' : 'Desbloquear usuário?',
      description: shouldBlock
        ? `${target.name} perderá imediatamente o acesso aos dados e ao aplicativo.`
        : `${target.name} poderá acessar o aplicativo novamente.`,
      variant: shouldBlock ? 'danger' : 'info',
      onConfirm: () => toggleBlocked.mutate({ target, blocked: shouldBlock }),
    });
  };

  return (
    <div className="page mx-auto flex min-w-0 max-w-2xl flex-col gap-5 pb-28">
      <Link to="/perfil" className="flex w-fit items-center gap-2 rounded-xl px-2 py-1 text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-button)]">
        <ArrowLeft size={17} /> Voltar ao perfil
      </Link>

      <section className="relative overflow-hidden rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-violet-500/20 via-[var(--surface-raised)] to-fuchsia-400/15 p-5 shadow-[var(--shadow-raised)] sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
            <ShieldCheck size={28} />
          </div>
          <div className="min-w-0">
            <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.17em] text-violet-500"><Crown size={13} /> Área da desenvolvedora</span>
            <h1 className="text-2xl font-extrabold text-[var(--color-text)]">Administração</h1>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Usuários, acessos e visitas do aplicativo.</p>
          </div>
        </div>
        <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/90 p-3">
            <Users size={16} className="text-blue-500" />
            <strong className="mt-2 block text-2xl font-extrabold text-[var(--color-text)]">{usersList.length}</strong>
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">Usuários</span>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/90 p-3">
            <UserCheck size={16} className="text-[var(--color-success)]" />
            <strong className="mt-2 block text-2xl font-extrabold text-[var(--color-text)]">{usersList.length - blockedUsers}</strong>
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">Ativos</span>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/90 p-3">
            <UserX size={16} className="text-[var(--color-danger)]" />
            <strong className="mt-2 block text-2xl font-extrabold text-[var(--color-text)]">{blockedUsers}</strong>
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">Bloqueados</span>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/90 p-3">
            <Activity size={16} className="text-violet-500" />
            <strong className="mt-2 block text-2xl font-extrabold text-[var(--color-text)]">{visits.length}</strong>
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">Visitas</span>
          </div>
        </div>
      </section>

      <section className="flex min-w-0 flex-col gap-4 rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-lg font-extrabold text-[var(--color-text)]">Visitas por período</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">{uniqueVisitors} usuário(s) único(s) no filtro selecionado.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[var(--surface-subtle)] p-1.5">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`min-h-10 rounded-xl px-3 text-sm font-bold transition-all ${period === option.value ? 'bg-[var(--surface-elevated)] text-[var(--color-button)] shadow-sm' : 'text-[var(--color-text-secondary)]'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="flex min-w-0 flex-col gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--color-text)]">Usuários cadastrados</h2>
          <p className="text-xs text-[var(--color-text-secondary)]">Pesquise, acompanhe visitas e controle o acesso.</p>
        </div>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou e-mail" leftIcon={<Search size={18} />} />
        {usersQuery.isLoading ? (
          <SkeletonList count={5} />
        ) : usersQuery.isError || visitsQuery.isError ? (
          <div className="rounded-2xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-4 text-sm text-[var(--color-danger)]">
            Não foi possível carregar os dados administrativos. Verifique se as regras do Firestore foram publicadas.
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-raised)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            {filteredUsers.map((item) => {
              const isAdmin = item.role === 'admin';
              const isCurrentUser = item.uid === user?.uid;
              const isPending = toggleBlocked.isPending && toggleBlocked.variables?.target.uid === item.uid;

              return (
                <article key={item.uid} className="flex min-w-0 flex-col gap-4 rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar src={item.photoURL} name={item.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-extrabold text-[var(--color-text)]">{item.name}</h3>
                        {isAdmin && <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-violet-500">Admin</span>}
                        {item.blocked && <span className="rounded-full bg-[var(--color-danger)]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[var(--color-danger)]">Bloqueado</span>}
                      </div>
                      <p className="break-all text-xs text-[var(--color-text-secondary)]">{item.email}</p>
                      <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">Cadastro: {formatCreatedAt(item)}</p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-[var(--surface-subtle)] p-3">
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Visitas no período</span>
                    <strong className="text-lg font-extrabold text-[var(--color-text)]">{visitCounts.get(item.uid) ?? 0}</strong>
                  </div>

                  <Button
                    variant={item.blocked ? 'outline' : 'danger'}
                    fullWidth
                    icon={item.blocked ? <UnlockKeyhole size={17} /> : <Ban size={17} />}
                    loading={isPending}
                    disabled={isAdmin || isCurrentUser}
                    onClick={() => handleToggleBlocked(item)}
                    title={isAdmin ? 'Contas administrativas são protegidas' : isCurrentUser ? 'Você não pode bloquear sua própria conta' : undefined}
                  >
                    {item.blocked ? 'Desbloquear usuário' : 'Bloquear usuário'}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

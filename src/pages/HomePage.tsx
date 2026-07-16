import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowDownRight, ArrowUpRight, CreditCard, PlusCircle, Bell, CheckCircle2, Circle, Tags, ChevronRight, Menu, Sunrise, Sun, MoonStar, Sparkles } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

import { useAuth } from '@/providers/AuthProvider';
import { useDashboardData } from '@/hooks/useDashboard';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { useReminders } from '@/hooks/useReminders';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { getGreeting } from '@/utils/greeting';
import { formatCurrency } from '@/utils/currency';
import flowerImage from '@/assets/flor.png';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { SkeletonList, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { LucideIcon } from '@/components/ui/IconPicker';
import { Button } from '@/components/ui/Button';

// Animations variables
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const motivationalMessages = [
  'Cada escolha de hoje aproxima você dos seus sonhos.',
  'Pequenos cuidados constroem grandes conquistas.',
  'Organizar hoje traz mais tranquilidade amanhã.',
  'Seu futuro agradece cada passo consciente.',
  'Você está cuidando do que importa.',
];

export default function HomePage() {
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const { userProfile } = useAuth();
  const { totalBalance, monthlyIncome, monthlyExpense, recentTransactions, isLoading: isDashLoading } = useDashboardData();
  const { data: categories } = useCategories();
  const { data: accounts, isLoading: isAccountsLoading } = useAccounts();
  const { data: reminders = [], isLoading: isRemindersLoading, isError: isRemindersError } = useReminders();
  const today = new Date();
  const todayReminders = reminders.filter((reminder) => isSameDay(reminder.dueDate.toDate(), today));
  const messageIndex = (
    today.getFullYear() * 372 + today.getMonth() * 31 + today.getDate()
  ) % motivationalMessages.length;
  const motivationalMessage = motivationalMessages[messageIndex];
  
  const isLoading = isDashLoading || isAccountsLoading;
  
  const preferences = usePreferencesStore((s) => s.preferences);
  const setPreferences = usePreferencesStore((s) => s.setPreferences);

  useEffect(() => {
    const updateHour = () => setCurrentHour(new Date().getHours());
    const timer = window.setInterval(updateHour, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const greeting = getGreeting(undefined, currentHour);
  const greetingVisual = currentHour >= 5 && currentHour < 12
    ? { Icon: Sunrise, color: 'text-amber-500', background: 'from-amber-300/25 to-orange-400/15', label: 'Manhã' }
    : currentHour >= 12 && currentHour < 18
      ? { Icon: Sun, color: 'text-orange-500', background: 'from-yellow-300/25 to-orange-400/15', label: 'Tarde' }
      : currentHour >= 18
        ? { Icon: MoonStar, color: 'text-indigo-500', background: 'from-indigo-300/25 to-violet-400/15', label: 'Noite' }
        : { Icon: Sparkles, color: 'text-violet-500', background: 'from-violet-300/25 to-fuchsia-400/15', label: 'Madrugada' };
  const GreetingIcon = greetingVisual.Icon;
  const isHidden = preferences.hideValues;
  
  const toggleVisibility = () => {
    setPreferences({ ...preferences, hideValues: !isHidden });
    // Idealmente chamaríamos a mutation de updatePreferences aqui para salvar no banco também,
    // mas atualizar só no Zustand já dá a experiência imediata que queremos no app.
  };

  const renderHidden = (val: string) => (isHidden ? '••••••' : val);

  const getCategoryDetails = (categoryId: string) => {
    return categories?.find(c => c.id === categoryId) || { name: 'Desconhecido', icon: 'Tag', color: 'var(--color-border)' };
  };

  if (isLoading) {
    return (
      <div className="page max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-full bg-[var(--color-border)] animate-pulse" />
          <div className="flex flex-col gap-2 w-1/2">
            <div className="h-4 bg-[var(--color-border)] rounded animate-pulse" />
            <div className="h-6 bg-[var(--color-border)] rounded animate-pulse w-3/4" />
          </div>
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonList count={3} />
      </div>
    );
  }

  // Cálculos para a barra de progresso do mês
  const totalFlow = monthlyIncome + monthlyExpense;
  const incomePercent = totalFlow > 0 ? Math.round((monthlyIncome / totalFlow) * 100) : 0;
  const expensePercent = totalFlow > 0 ? Math.round((monthlyExpense / totalFlow) * 100) : 0;

  return (
    <motion.div 
      className="page max-w-2xl mx-auto flex flex-col gap-6 pb-24"
      variants={containerVariants}
      initial={preferences.animationsEnabled ? "hidden" : "show"}
      animate="show"
    >
      {/* Header Profile */}
      <motion.div variants={itemVariants} className="flex min-w-0 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0 pr-2">
            <Avatar src={userProfile?.photoURL} name={userProfile?.name} size="lg" />
            <Link
              to="/perfil"
              className="absolute -bottom-1 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--color-bg)] bg-[var(--color-button)] text-white shadow-md transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-button)]/30"
              aria-label="Abrir perfil e configurações"
              title="Perfil e configurações"
            >
              <Menu size={16} strokeWidth={2.5} />
            </Link>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="flex min-w-0 items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${greetingVisual.background} ${greetingVisual.color} shadow-sm`}
                title={greetingVisual.label}
                aria-hidden="true"
              >
                <GreetingIcon size={15} strokeWidth={2.2} />
              </span>
              <span className="truncate">{greeting},</span>
            </span>
            <span className="truncate text-lg font-bold leading-tight text-[var(--color-text)]">{userProfile?.name?.split(' ')[0]}</span>
          </div>
        </div>
        <button 
          onClick={toggleVisibility}
          className="shrink-0 p-2 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          aria-label={isHidden ? "Mostrar valores" : "Ocultar valores"}
        >
          {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </motion.div>

      {/* Saldo Geral Card */}
      <motion.div variants={itemVariants}>
        <Card padding="lg" className="balance-card relative overflow-hidden border-none text-white">
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white rounded-full opacity-10 blur-xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-black rounded-full opacity-5 blur-xl" />
          <img
            src={flowerImage}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 h-auto w-[40%] max-w-none -translate-y-1/2 select-none object-contain object-right opacity-70 drop-shadow-xl"
          />
          
          <div className="relative z-10 flex max-w-[72%] min-w-0 flex-col gap-1">
            <span className="mb-2 block max-w-[85%] break-words text-[10px] font-medium leading-relaxed text-white/75 sm:text-[11px]">
              {motivationalMessage}
            </span>
            <span className="text-sm font-medium opacity-90 flex items-center gap-1">
              <CreditCard size={16} /> Saldo Geral
            </span>
            <span className="text-3xl font-bold tracking-tight">
              {isHidden ? '••••••' : formatCurrency(totalBalance)}
            </span>
          </div>
        </Card>
      </motion.div>

      {/* Resumo do Mês */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <h3 className="font-semibold text-lg text-[var(--color-text)]">Resumo do Mês</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 flex flex-col gap-2">
            <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
              <ArrowDownRight size={14} className="text-[var(--color-success)]" /> Entradas
            </span>
            <span className={`font-semibold ${!isHidden ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'} text-lg`}>
              {renderHidden(formatCurrency(monthlyIncome))}
            </span>
          </Card>
          <Card className="p-4 flex flex-col gap-2">
            <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
              <ArrowUpRight size={14} className="text-[var(--color-danger)]" /> Saídas
            </span>
            <span className={`font-semibold ${!isHidden ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)]'} text-lg`}>
              {renderHidden(formatCurrency(monthlyExpense))}
            </span>
          </Card>
        </div>
        
        {/* Barra Visual */}
        {totalFlow > 0 && (
          <div className="flex h-2 w-full bg-[var(--color-bg-secondary)] rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[var(--color-success)] transition-all duration-1000" style={{ width: `${incomePercent}%` }} />
            <div className="h-full bg-[var(--color-danger)] transition-all duration-1000" style={{ width: `${expensePercent}%` }} />
          </div>
        )}
      </motion.div>

      {/* Acessos de organização financeira */}
      <motion.section variants={itemVariants} className="relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-[28px] border border-[var(--color-info)]/15 bg-gradient-to-br from-[var(--color-info)]/10 via-[var(--surface-raised)] to-[var(--color-primary)]/15 p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[var(--color-info)]/10 blur-2xl" />
        <div className="relative flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-info)] to-[var(--color-button)] text-white shadow-lg shadow-[var(--color-info)]/20">
            <CreditCard size={21} />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-info)]">Central financeira</span>
            <h2 className="text-lg font-extrabold text-[var(--color-text)]">Organização financeira</h2>
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">Gerencie a estrutura que mantém suas finanças organizadas.</p>
          </div>
        </div>

        <div className="relative grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/contas"
            className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-[22px] border border-blue-500/15 bg-[var(--surface-elevated)]/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-500/35 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/15"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500" />
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <CreditCard size={23} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-extrabold text-[var(--color-text)]">Contas e cartões</span>
              <span className="text-xs leading-relaxed text-[var(--color-text-secondary)]">Saldos, limites e cadastros</span>
            </div>
            <ChevronRight size={18} className="shrink-0 text-blue-500 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to="/categorias"
            className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-[22px] border border-emerald-500/15 bg-[var(--surface-elevated)]/90 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500/35 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-600" />
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Tags size={23} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-extrabold text-[var(--color-text)]">Categorias</span>
              <span className="text-xs leading-relaxed text-[var(--color-text-secondary)]">Organize receitas e despesas</span>
            </div>
            <ChevronRight size={18} className="shrink-0 text-emerald-500 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.section>

      {/* Contas e cartões */}
      <motion.section variants={itemVariants} className="flex min-w-0 flex-col gap-4 rounded-[28px] border border-violet-400/20 bg-gradient-to-br from-violet-300/10 via-[var(--surface-raised)] to-fuchsia-300/10 p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-500">Visão rápida</span>
            <h2 className="text-lg font-extrabold text-[var(--color-text)]">Suas contas</h2>
          </div>
          <Link to="/contas" className="shrink-0 rounded-xl bg-[var(--surface-elevated)] px-3 py-2 text-xs font-bold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-button)] focus:outline-none focus:ring-2 focus:ring-[var(--color-button)]/20">
            Gerenciar
          </Link>
        </div>

        {accounts?.some((account) => !account.archived) ? (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x" style={{ scrollbarWidth: 'none' }}>
            {accounts.filter((account) => !account.archived).map((account) => (
              <Card key={account.id} className="relative flex min-w-[168px] shrink-0 snap-center flex-col gap-4 overflow-hidden rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
                <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: account.color }} />
                <div className="flex min-w-0 items-center gap-2 pt-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm" style={{ backgroundColor: account.color }}>
                    <LucideIcon name={account.icon} size={18} />
                  </div>
                  <span className="min-w-0 truncate text-sm font-extrabold text-[var(--color-text)]">{account.name}</span>
                </div>
                <div className="flex min-w-0 flex-col rounded-2xl bg-[var(--surface-subtle)] p-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    {account.type === 'credit_card' ? 'Limite disponível' : 'Saldo atual'}
                  </span>
                  <span className={`mt-1 min-w-0 break-all text-base font-extrabold ${account.type === 'credit_card' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)]'}`}>
                    {renderHidden(formatCurrency(account.type === 'credit_card' ? (account.creditLimit ?? 0) : account.initialBalance))}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 text-sm text-[var(--color-text-secondary)]">Nenhuma conta cadastrada ainda.</p>
        )}

        <Link
          to="/contas?acao=nova"
          className="group relative flex min-w-0 items-center gap-3 overflow-hidden rounded-[22px] border border-sky-400/25 bg-gradient-to-r from-sky-300/20 to-blue-400/10 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-400/45 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-sky-400/15"
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-300 to-blue-500" />
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-600 dark:text-sky-300">
            <PlusCircle size={23} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="font-extrabold text-[var(--color-text)]">Nova conta</span>
            <span className="text-xs leading-relaxed text-[var(--color-text-secondary)]">Cadastre uma conta, carteira ou cartão</span>
          </div>
          <ChevronRight size={18} className="shrink-0 text-sky-600 transition-transform group-hover:translate-x-1 dark:text-sky-300" />
        </Link>
      </motion.section>

      {/* Lembretes programados para hoje */}
      <motion.section variants={itemVariants} className="relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-[28px] border border-[var(--color-warning)]/15 bg-gradient-to-br from-[var(--color-warning)]/10 via-[var(--surface-raised)] to-[var(--color-primary)]/10 p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--color-warning)]/10 blur-2xl" />
        <div className="relative flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-warning)] to-amber-600 text-white shadow-lg shadow-[var(--color-warning)]/20">
              <Bell size={21} />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-warning)]">Sua agenda</span>
              <h2 className="text-lg font-extrabold text-[var(--color-text)]">Lembretes de hoje</h2>
            </div>
          </div>
          <Link to="/lembretes" className="shrink-0 rounded-xl bg-[var(--surface-elevated)] px-3 py-2 text-xs font-bold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-button)] focus:outline-none focus:ring-2 focus:ring-[var(--color-button)]/20">
            Ver todos
          </Link>
        </div>

        {isRemindersLoading ? (
          <SkeletonList count={2} />
        ) : isRemindersError ? (
          <div className="rounded-2xl border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-4 text-sm font-medium text-[var(--color-danger)]">
            Não foi possível carregar os lembretes de hoje.
          </div>
        ) : todayReminders.length === 0 ? (
          <div className="relative flex min-w-0 items-center gap-3 rounded-[22px] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]/85 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-success)]/10 text-[var(--color-success)]">
              <CheckCircle2 size={21} />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-bold text-[var(--color-text)]">Agenda livre por hoje</span>
              <span className="text-xs leading-relaxed text-[var(--color-text-secondary)]">Nenhum lembrete está programado para esta data.</span>
            </div>
          </div>
        ) : (
          <div className="relative flex min-w-0 flex-col gap-2.5">
            {todayReminders.map((reminder) => (
              <Link
                key={reminder.id}
                to="/lembretes"
                className="group flex min-w-0 items-center gap-3 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/90 p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-warning)]/30 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[var(--color-warning)]/15"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${reminder.isDone ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'}`}>
                  {reminder.isDone ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={`break-words text-sm font-extrabold ${reminder.isDone ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'}`}>
                    {reminder.title}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {format(reminder.dueDate.toDate(), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
                <div className="max-w-[38%] shrink-0 text-right">
                  <span className="block break-all text-sm font-extrabold text-[var(--color-text)]">
                    {reminder.amount !== null ? renderHidden(formatCurrency(reminder.amount)) : 'Variável'}
                  </span>
                  <ChevronRight size={14} className="ml-auto mt-1 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.section>

      {/* Transações recentes */}
      <motion.section variants={itemVariants} className="relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-[28px] border border-[var(--color-accent)]/15 bg-gradient-to-br from-[var(--color-accent)]/10 via-[var(--surface-raised)] to-[var(--color-info)]/10 p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-button)] text-white shadow-lg shadow-[var(--color-accent)]/20">
              <ArrowUpRight size={21} />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--color-accent)]">Movimentações</span>
              <h2 className="text-lg font-extrabold text-[var(--color-text)]">Últimos lançamentos</h2>
            </div>
          </div>
          {recentTransactions.length > 0 && (
            <Link to="/lancar" className="shrink-0 rounded-xl bg-[var(--surface-elevated)] px-3 py-2 text-xs font-bold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-button)] focus:outline-none focus:ring-2 focus:ring-[var(--color-button)]/20">
              Ver todos
            </Link>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <div className="flex min-w-0 flex-col gap-3">
            <EmptyState
              icon={<CreditCard size={32} />}
              title="Nenhum lançamento recente"
              description="Você ainda não registrou nada neste mês."
            />
            <Link to="/lancar">
              <Button variant="outline" fullWidth className="border-dashed">
                Fazer meu primeiro lançamento
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-2.5">
            {recentTransactions.map((tx) => {
              const isTransfer = tx.type === 'transfer';
              const cat = isTransfer ? { name: 'Transferência', icon: 'ArrowRightLeft', color: 'var(--color-info)' } : getCategoryDetails(tx.categoryId);
              
              return (
                <div key={tx.id} className="group flex min-w-0 items-center justify-between gap-3 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/90 p-3.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-accent)]/25 hover:shadow-md">
                  <div className="flex min-w-0 items-center gap-3">
                    <div 
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      <LucideIcon name={cat.icon} size={20} />
                    </div>
                    
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-extrabold text-[var(--color-text)]">{tx.description}</span>
                      <span className="mt-0.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
                        {cat.name} · {format(tx.date.toDate(), "dd 'de' MMM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>

                  <div className="max-w-[42%] shrink-0 text-right">
                    <span className={`block break-all text-sm font-extrabold ${!isHidden ? (tx.type === 'expense' ? 'text-[var(--color-danger)]' : tx.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]') : 'text-[var(--color-text)]'}`}>
                      {isHidden ? '••••••' : `${tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}${formatCurrency(tx.amount)}`}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                      {tx.type === 'expense' ? 'Saída' : tx.type === 'income' ? 'Entrada' : 'Transferência'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

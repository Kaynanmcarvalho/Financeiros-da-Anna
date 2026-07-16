import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Plus, Target, Bell, Calendar as CalendarIcon, CheckCircle2, Circle, Wallet, Pencil, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useCompleteGoal, useDeleteGoal, useGoals } from '@/hooks/useGoals';
import { useDeleteReminder, useReminders, useToggleReminder } from '@/hooks/useReminders';
import { useBudget, useDeleteBudget } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useUIStore } from '@/stores/uiStore';
import { formatCurrency } from '@/utils/currency';
import type { Goal, Reminder } from '@/types';

import { Card } from '@/components/ui/Card';
import { SkeletonList, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { LucideIcon } from '@/components/ui/IconPicker';
import { Button } from '@/components/ui/Button';

import { GoalForm } from '@/components/planning/GoalForm';
import { ReminderForm } from '@/components/planning/ReminderForm';
import { BudgetForm } from '@/components/planning/BudgetForm';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { MonthSelector } from '@/components/transactions/MonthSelector';

type ActiveTab = 'budget' | 'goals' | 'reminders';

export default function PlanningPage() {
  const location = useLocation();
  const activeTab: ActiveTab = location.pathname.includes('desejos')
    ? 'goals'
    : location.pathname.includes('lembretes')
      ? 'reminders'
      : 'budget';

  const [budgetDate, setBudgetDate] = useState(new Date());
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [reminderToEdit, setReminderToEdit] = useState<Reminder | null>(null);
  const budgetMonth = format(budgetDate, 'yyyy-MM');

  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);
  const openConfirmDialog = useUIStore((s) => s.openConfirmDialog);
  const { data: budget, isLoading: isLoadingBudget } = useBudget(budgetMonth);
  const { data: categories } = useCategories();
  const { data: goals, isLoading: isLoadingGoals } = useGoals();
  const { data: reminders, isLoading: isLoadingReminders } = useReminders();
  const deleteBudgetMutation = useDeleteBudget();
  const completeGoalMutation = useCompleteGoal();
  const toggleReminderMutation = useToggleReminder();
  const deleteGoalMutation = useDeleteGoal();
  const deleteReminderMutation = useDeleteReminder();
  const expenseCategories = categories?.filter((category) => category.type === 'expense') ?? [];

  const openBudgetForm = () => setIsBudgetFormOpen(true);
  const closeBudgetForm = () => setIsBudgetFormOpen(false);

  const handleDeleteBudget = () => {
    openConfirmDialog({
      title: 'Excluir planejamento?',
      description: 'Todos os limites definidos para este mês serão excluídos. Essa ação não pode ser desfeita.',
      variant: 'danger',
      onConfirm: () => deleteBudgetMutation.mutate(budgetMonth),
    });
  };

  const openNewGoal = () => {
    setGoalToEdit(null);
    setIsGoalFormOpen(true);
  };

  const openNewReminder = () => {
    setReminderToEdit(null);
    setIsReminderFormOpen(true);
  };

  const closeGoalForm = () => {
    setIsGoalFormOpen(false);
    setGoalToEdit(null);
  };

  const closeReminderForm = () => {
    setIsReminderFormOpen(false);
    setReminderToEdit(null);
  };

  const handleEditGoal = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsGoalFormOpen(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setReminderToEdit(reminder);
    setIsReminderFormOpen(true);
  };

  const handleDeleteGoal = (goal: Goal) => {
    openConfirmDialog({
      title: 'Excluir desejo?',
      description: `Tem certeza que deseja excluir "${goal.title}"? Essa ação não pode ser desfeita.`,
      variant: 'danger',
      onConfirm: () => deleteGoalMutation.mutate(goal.id),
    });
  };

  const handleDeleteReminder = (reminder: Reminder) => {
    openConfirmDialog({
      title: 'Excluir lembrete?',
      description: `Tem certeza que deseja excluir "${reminder.title}"? Essa ação não pode ser desfeita.`,
      variant: 'danger',
      onConfirm: () => deleteReminderMutation.mutate(reminder.id),
    });
  };

  const handleToggleReminder = (reminder: Reminder) => {
    if (!reminder.isDone) setIsTransactionFormOpen(true);
    toggleReminderMutation.mutate({ id: reminder.id, isDone: !reminder.isDone });
  };

  const getReminderStatusColor = (dueDate: Date) => {
    const days = differenceInDays(dueDate, new Date());
    if (days < 0) return 'text-[var(--color-danger)]';
    if (days <= 3) return 'text-[var(--color-warning)]';
    return 'text-[var(--color-success)]';
  };

  const actionButtonClass = 'flex min-w-0 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30';
  const deleteButtonClass = `${actionButtonClass} hover:border-[var(--color-danger)]/30 hover:text-[var(--color-danger)]`;

  return (
    <div className="page mx-auto flex min-w-0 max-w-2xl flex-col gap-6 overflow-x-hidden pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="min-w-0"
          initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={animationsEnabled ? { opacity: 0, y: -10 } : undefined}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'budget' ? (
            <div className="flex min-w-0 flex-col gap-5">
              <section className="relative overflow-hidden rounded-[28px] border border-[var(--color-warning)]/20 bg-gradient-to-br from-[var(--color-warning)]/15 via-[var(--surface-raised)] to-[var(--color-primary)]/15 p-5 shadow-[var(--shadow-soft)] sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--color-warning)]/10 blur-2xl" />
                <div className="relative flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-button)] text-white shadow-lg shadow-[var(--color-warning)]/20">
                    <Wallet size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-warning)]">Organização mensal</span>
                    <h1 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">Meu planejamento</h1>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">Defina limites por categoria e cuide do seu mês com mais tranquilidade.</p>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="min-w-0 rounded-2xl border border-[var(--color-border)]/70 bg-[var(--surface-elevated)]/85 p-3 backdrop-blur-sm">
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Total planejado</span>
                    <strong className="mt-1 block min-w-0 break-all text-base font-extrabold text-[var(--color-text)] sm:text-lg">
                      {formatCurrency(budget?.limits.reduce((total, item) => total + item.limit, 0) ?? 0)}
                    </strong>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--surface-elevated)]/85 p-3 backdrop-blur-sm">
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Categorias</span>
                    <strong className="mt-1 block text-2xl font-extrabold text-[var(--color-text)]">{budget?.limits.length ?? 0}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openBudgetForm}
                  className="relative mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--color-warning)] to-[var(--color-button)] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-[var(--color-warning)]/20 transition-all hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-warning)]/20"
                >
                  <Plus size={18} /> {budget ? 'Editar planejamento' : 'Adicionar planejamento'}
                </button>
              </section>

              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-2 shadow-[var(--shadow-soft)]">
                <MonthSelector currentDate={budgetDate} onChange={setBudgetDate} />
              </div>

              {isLoadingBudget ? (
                <SkeletonCard />
              ) : !budget ? (
                <div className="flex min-w-0 flex-col gap-3">
                  <EmptyState
                    icon={<Wallet size={40} />}
                    title="Nenhum planejamento neste mês"
                    description="Defina limites por categoria para organizar seus gastos mensais."
                  />
                </div>
              ) : (
                <Card className="relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-[24px] border border-[var(--color-warning)]/15 bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-warning)] to-[var(--color-button)]" />
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 pt-1">
                    <div className="flex min-w-0 flex-col">
                      <span className="text-sm text-[var(--color-text-secondary)]">Total planejado</span>
                      <strong className="break-all text-2xl text-[var(--color-primary)]">
                        {formatCurrency(budget.limits.reduce((total, item) => total + item.limit, 0))}
                      </strong>
                    </div>
                    <span className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold capitalize text-[var(--color-primary)]">
                      {format(budgetDate, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col divide-y divide-[var(--color-border)]">
                    {budget.limits.map((item) => {
                      const category = expenseCategories.find((candidate) => candidate.id === item.categoryId);
                      return (
                        <div key={item.categoryId} className="flex min-w-0 items-center gap-3 py-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                            style={{ backgroundColor: category?.color ?? 'var(--color-text-muted)' }}
                          >
                            {category ? <LucideIcon name={category.icon} size={20} /> : <Wallet size={20} />}
                          </div>
                          <span className="min-w-0 flex-1 break-words text-sm font-semibold text-[var(--color-text)]">
                            {category?.name ?? 'Categoria removida'}
                          </span>
                          <strong className="max-w-[45%] shrink-0 break-all text-right text-sm text-[var(--color-text)]">
                            {formatCurrency(item.limit)}
                          </strong>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid min-w-0 grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-3">
                    <button type="button" className={actionButtonClass} onClick={openBudgetForm}>
                      <Pencil size={17} className="shrink-0" />
                      <span className="min-w-0">Editar</span>
                    </button>
                    <button type="button" className={deleteButtonClass} onClick={handleDeleteBudget}>
                      <Trash2 size={17} className="shrink-0" />
                      <span className="min-w-0">Excluir</span>
                    </button>
                  </div>
                </Card>
              )}
            </div>
          ) : activeTab === 'goals' ? (
            <div className="flex min-w-0 flex-col gap-5">
              <section className="relative overflow-hidden rounded-[28px] border border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent)]/15 via-[var(--surface-raised)] to-[var(--color-primary)]/20 p-5 shadow-[var(--shadow-soft)] sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--color-accent)]/12 blur-2xl" />
                <div className="relative flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-button)] text-white shadow-lg shadow-[var(--color-accent)]/20">
                    <Target size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">Sonhos e conquistas</span>
                    <h1 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">Meus desejos</h1>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">Transforme seus planos em metas e acompanhe cada conquista.</p>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--surface-elevated)]/85 p-3 backdrop-blur-sm">
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Em andamento</span>
                    <strong className="mt-1 block text-2xl font-extrabold text-[var(--color-text)]">{goals?.filter((goal) => goal.status !== 'completed').length ?? 0}</strong>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--surface-elevated)]/85 p-3 backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]"><CheckCircle2 size={14} className="text-[var(--color-success)]" /> Realizados</span>
                    <strong className="mt-1 block text-2xl font-extrabold text-[var(--color-text)]">{goals?.filter((goal) => goal.status === 'completed').length ?? 0}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openNewGoal}
                  className="relative mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-button)] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-[var(--color-accent)]/20 transition-all hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)]/20"
                >
                  <Plus size={18} /> Adicionar novo desejo
                </button>
              </section>

              {isLoadingGoals ? (
                <SkeletonCard />
              ) : !goals?.length ? (
                <EmptyState
                  icon={<Target size={40} />}
                  title="Nenhuma meta definida"
                  description="Que tal começar a poupar para aquela viagem ou carro novo?"
                />
              ) : (
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                  {goals.map((goal) => {
                    const percent = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
                    return (
                      <Card key={goal.id} className="relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
                        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: goal.color }} />
                        <div className="flex min-w-0 items-start gap-3 pt-1">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                            style={{ backgroundColor: goal.color }}
                          >
                            <LucideIcon name={goal.icon} size={24} />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col self-center">
                            <span className="break-words font-bold leading-tight text-[var(--color-text)]">{goal.title}</span>
                            {goal.deadline && (
                              <span className="mt-0.5 flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                                <CalendarIcon size={12} className="shrink-0" />
                                {format(goal.deadline.toDate(), 'MMM yyyy', { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex min-w-0 flex-col gap-1">
                          <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 text-sm">
                            <span className="break-all font-semibold text-[var(--color-primary)]">{formatCurrency(goal.savedAmount)}</span>
                            <span className="break-all text-[var(--color-text-secondary)]">{formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-secondary)]">
                            <div className="h-2.5 rounded-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: goal.color }} />
                          </div>
                        </div>

                        <Button
                          variant={goal.status === 'completed' ? 'secondary' : 'outline'}
                          size="sm"
                          className="mt-2 w-full"
                          icon={<CheckCircle2 size={17} />}
                          onClick={() => completeGoalMutation.mutate(goal.id)}
                          loading={completeGoalMutation.isPending && completeGoalMutation.variables === goal.id}
                          disabled={goal.status === 'completed'}
                        >
                          Realizado
                        </Button>

                        <div className="grid min-w-0 grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-3">
                          <button type="button" className={actionButtonClass} onClick={() => handleEditGoal(goal)} aria-label={`Editar ${goal.title}`}>
                            <Pencil size={17} className="shrink-0" />
                            <span className="min-w-0">Editar</span>
                          </button>
                          <button type="button" className={deleteButtonClass} onClick={() => handleDeleteGoal(goal)} aria-label={`Excluir ${goal.title}`}>
                            <Trash2 size={17} className="shrink-0" />
                            <span className="min-w-0">Excluir</span>
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-5">
              <section className="relative overflow-hidden rounded-[28px] border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)]/20 via-[var(--surface-raised)] to-[var(--color-accent)]/10 p-5 shadow-[var(--shadow-soft)] sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--color-button)]/10 blur-2xl" />
                <div className="relative flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-button)] text-white shadow-lg shadow-[var(--color-button)]/20">
                    <Bell size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-button)]">Agenda financeira</span>
                    <h1 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">Meus lembretes</h1>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">Acompanhe seus vencimentos com tranquilidade e mantenha tudo em dia.</p>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--surface-elevated)]/80 p-3 backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
                      <CalendarIcon size={14} className="text-[var(--color-warning)]" /> Pendentes
                    </span>
                    <strong className="mt-1 block text-2xl font-extrabold text-[var(--color-text)]">
                      {reminders?.filter((reminder) => !reminder.isDone).length ?? 0}
                    </strong>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--surface-elevated)]/80 p-3 backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
                      <CheckCircle2 size={14} className="text-[var(--color-success)]" /> Realizados
                    </span>
                    <strong className="mt-1 block text-2xl font-extrabold text-[var(--color-text)]">
                      {reminders?.filter((reminder) => reminder.isDone).length ?? 0}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openNewReminder}
                  className="relative mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--color-button)] to-[var(--color-accent)] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-[var(--color-button)]/20 transition-all hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-button)]/20"
                >
                  <Plus size={18} />
                  Adicionar novo lembrete
                </button>
              </section>

              {isLoadingReminders ? (
                <SkeletonList count={4} />
              ) : !reminders?.length ? (
                <EmptyState
                  icon={<Bell size={40} />}
                  title="Tudo em dia!"
                  description="Você não tem nenhum lembrete de conta a pagar cadastrado."
                />
              ) : (
                <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                  {reminders.map((reminder) => {
                    const dueDate = reminder.dueDate.toDate();
                    const daysUntil = differenceInDays(dueDate, new Date());
                    const isOverdue = daysUntil < 0 && !reminder.isDone;
                    const recurrenceLabel = reminder.recurrence === 'weekly'
                      ? 'Semanal'
                      : reminder.recurrence === 'monthly'
                        ? 'Mensal'
                        : reminder.recurrence === 'yearly'
                          ? 'Anual'
                          : null;
                    const statusLabel = reminder.isDone
                      ? 'Realizado'
                      : isOverdue
                        ? 'Vencido'
                        : daysUntil === 0
                          ? 'Vence hoje'
                          : daysUntil === 1
                            ? 'Vence amanhã'
                            : `Vence em ${daysUntil} dias`;

                    return (
                      <article
                        key={reminder.id}
                        className={`group relative flex min-w-0 flex-col overflow-hidden rounded-[24px] border p-4 shadow-[var(--shadow-soft)] transition-all sm:p-5 ${
                          reminder.isDone
                            ? 'border-[var(--color-success)]/20 bg-[var(--surface-raised)]'
                            : isOverdue
                              ? 'border-[var(--color-danger)]/25 bg-gradient-to-br from-[var(--color-danger)]/10 to-[var(--surface-raised)]'
                              : 'border-[var(--border-subtle)] bg-[var(--surface-raised)]'
                        }`}
                      >
                        <div className={`absolute inset-x-0 top-0 h-1 ${reminder.isDone ? 'bg-[var(--color-success)]' : isOverdue ? 'bg-[var(--color-danger)]' : 'bg-gradient-to-r from-[var(--color-button)] to-[var(--color-accent)]'}`} />

                        <div className="flex min-w-0 items-start gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => handleToggleReminder(reminder)}
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all focus:outline-none focus:ring-4 focus:ring-[var(--color-button)]/15 ${reminder.isDone ? 'border-[var(--color-success)]/20 bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'border-[var(--color-border)] bg-[var(--surface-elevated)] text-[var(--color-text-muted)] hover:border-[var(--color-button)]/30 hover:text-[var(--color-button)]'}`}
                            aria-label={reminder.isDone ? `Marcar ${reminder.title} como pendente` : `Marcar ${reminder.title} como realizado`}
                          >
                            {reminder.isDone ? <CheckCircle2 size={25} /> : <Circle size={25} />}
                          </button>

                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className={`break-words text-base font-bold leading-snug ${reminder.isDone ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'}`}>
                              {reminder.title}
                            </span>
                            <span className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">
                              {format(dueDate, "EEEE, dd 'de' MMM", { locale: ptBR })}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${reminder.isDone ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : isOverdue ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]' : `bg-[var(--color-bg-secondary)] ${getReminderStatusColor(dueDate)}`}`}>
                            <CalendarIcon size={12} />
                            {statusLabel}
                          </span>
                          {recurrenceLabel && (
                            <span className="rounded-full bg-[var(--color-primary)]/30 px-2.5 py-1 text-[11px] font-bold text-[var(--color-text-secondary)]">
                              Repete: {recurrenceLabel}
                            </span>
                          )}
                        </div>

                        <div className="my-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3.5">
                          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Valor previsto</span>
                          <span className={`mt-1 block min-w-0 break-all text-xl font-extrabold ${reminder.isDone ? 'text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'}`}>
                            {reminder.amount !== null ? formatCurrency(reminder.amount) : 'Valor variável'}
                          </span>
                        </div>

                        <div className="mt-auto grid min-w-0 grid-cols-2 gap-2 border-t border-[var(--border-subtle)] pt-3">
                          <button type="button" className="flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-xl bg-[var(--surface-elevated)] px-3 py-2 text-sm font-bold text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-button)] focus:outline-none focus:ring-2 focus:ring-[var(--color-button)]/25" onClick={() => handleEditReminder(reminder)} aria-label={`Editar ${reminder.title}`}>
                            <Pencil size={16} className="shrink-0" />
                            <span className="min-w-0">Editar</span>
                          </button>
                          <button type="button" className="flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-danger)]/5 px-3 py-2 text-sm font-bold text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-danger)]/25" onClick={() => handleDeleteReminder(reminder)} aria-label={`Excluir ${reminder.title}`}>
                            <Trash2 size={16} className="shrink-0" />
                            <span className="min-w-0">Excluir</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={activeTab === 'budget' ? openBudgetForm : activeTab === 'goals' ? openNewGoal : openNewReminder}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-button)] text-white shadow-lg shadow-[var(--color-button)]/30 transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-button)]/20 sm:left-1/2 sm:right-auto sm:ml-[260px]"
        aria-label={activeTab === 'budget' ? (budget ? 'Editar planejamento' : 'Adicionar planejamento') : activeTab === 'goals' ? 'Novo desejo' : 'Novo lembrete'}
      >
        <Plus size={24} />
      </button>

      <BudgetForm
        isOpen={isBudgetFormOpen}
        onClose={closeBudgetForm}
        month={budgetMonth}
        budget={budget}
        categories={expenseCategories}
      />
      <GoalForm isOpen={isGoalFormOpen} onClose={closeGoalForm} goal={goalToEdit} />
      <ReminderForm isOpen={isReminderFormOpen} onClose={closeReminderForm} reminder={reminderToEdit} />
      <TransactionForm isOpen={isTransactionFormOpen} onClose={() => setIsTransactionFormOpen(false)} defaultType="expense" />
    </div>
  );
}

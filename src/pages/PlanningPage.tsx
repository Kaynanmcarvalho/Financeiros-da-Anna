import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Target, Bell, Calendar as CalendarIcon, CheckCircle2, Circle, Wallet } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useGoals } from '@/hooks/useGoals';
import { useReminders, useToggleReminder } from '@/hooks/useReminders';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { formatCurrency } from '@/utils/currency';
import type { Reminder } from '@/types';

import { Tabs } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { SkeletonList, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { LucideIcon } from '@/components/ui/IconPicker';
import { Button } from '@/components/ui/Button';

import { GoalForm } from '@/components/planning/GoalForm';
import { ReminderForm } from '@/components/planning/ReminderForm';
import { TransactionForm } from '@/components/transactions/TransactionForm';

export default function PlanningPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getInitialTab = () => {
    if (location.pathname.includes('desejos')) return 'goals';
    if (location.pathname.includes('lembretes')) return 'reminders';
    return 'budget';
  };

  const [activeTab, setActiveTab] = useState<'budget' | 'goals' | 'reminders'>(getInitialTab());
  
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    if (value === 'budget') navigate('/planejar');
    if (value === 'goals') navigate('/desejos');
    if (value === 'reminders') navigate('/lembretes');
  };
  
  // Modals state
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  
  // Transaction integration state
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
  
  // Custom Transaction Form props to prefill
  // We use a key to force re-render of TransactionForm with new default values if needed, 
  // but since we are just opening it, we will just rely on the user filling the rest.
  // Ideia de expansão: Passar default values complexos para o TransactionForm.
  // Por enquanto, o app abre limpo como Despesa.

  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);
  
  const { data: goals, isLoading: isLoadingGoals } = useGoals();
  const { data: reminders, isLoading: isLoadingReminders } = useReminders();
  const toggleReminderMutation = useToggleReminder();

  const handleToggleReminder = (reminder: Reminder) => {
    if (!reminder.isDone) {
      // Se está marcando como pago, abre o modal de transação!
      setIsTransactionFormOpen(true);
      // Idealmente passaríamos { description: reminder.title, amount: reminder.amount } pro form
    }
    toggleReminderMutation.mutate({ id: reminder.id, isDone: !reminder.isDone });
  };

  const getReminderStatusColor = (dueDate: Date) => {
    const days = differenceInDays(dueDate, new Date());
    if (days < 0) return 'text-[var(--color-danger)]'; // Vencido
    if (days <= 3) return 'text-[var(--color-warning)]'; // Vence em breve
    return 'text-[var(--color-success)]'; // No prazo
  };

  return (
    <div className="page max-w-2xl mx-auto flex flex-col gap-6 pb-24">
      <div className="sticky top-0 z-10 bg-[var(--color-bg)] pt-2 pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <Tabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={[
            { value: 'budget', label: 'Orçamento', icon: <Wallet size={16} /> },
            { value: 'goals', label: 'Desejos', icon: <Target size={16} /> },
            { value: 'reminders', label: 'Lembretes', icon: <Bell size={16} /> }
          ]} 
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={animationsEnabled ? { opacity: 0, y: -10 } : undefined}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'budget' ? (
            <div className="flex flex-col gap-4">
              <EmptyState
                icon={<Wallet size={40} />}
                title="Orçamento Mensal"
                description="O sistema de limite de gastos por categoria está em construção e chegará na próxima atualização!"
              />
            </div>
          ) : activeTab === 'goals' ? (
            <div className="flex flex-col gap-4">
              {isLoadingGoals ? (
                <SkeletonCard />
              ) : !goals || goals.length === 0 ? (
                <EmptyState
                  icon={<Target size={40} />}
                  title="Nenhuma meta definida"
                  description="Que tal começar a poupar para aquela viagem ou carro novo?"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {goals.map((goal) => {
                    const percent = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
                    return (
                      <Card key={goal.id} className="p-4 flex flex-col gap-3 relative overflow-hidden group">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                            style={{ backgroundColor: goal.color }}
                          >
                            <LucideIcon name={goal.icon} size={24} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[var(--color-text)] leading-tight">{goal.title}</span>
                            {goal.deadline && (
                              <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1 mt-0.5">
                                <CalendarIcon size={12} />
                                {format(goal.deadline.toDate(), "MMM yyyy", { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1 mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-[var(--color-primary)]">{formatCurrency(goal.savedAmount)}</span>
                            <span className="text-[var(--color-text-secondary)]">{formatCurrency(goal.targetAmount)}</span>
                          </div>
                          <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="h-2.5 rounded-full transition-all duration-1000" 
                              style={{ width: `${percent}%`, backgroundColor: goal.color }} 
                            />
                          </div>
                        </div>

                        <Button variant="outline" size="sm" className="mt-2 w-full border-dashed" onClick={() => {
                          // Implement deposit logic in future or open a quick modal
                          alert('Depósito rápido em breve!');
                        }}>
                          Depositar
                        </Button>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {isLoadingReminders ? (
                <SkeletonList count={4} />
              ) : !reminders || reminders.length === 0 ? (
                <EmptyState
                  icon={<Bell size={40} />}
                  title="Tudo em dia!"
                  description="Você não tem nenhum lembrete de conta a pagar cadastrado."
                />
              ) : (
                reminders.map((reminder) => {
                  const dueDate = reminder.dueDate.toDate();
                  const isOverdue = differenceInDays(dueDate, new Date()) < 0 && !reminder.isDone;

                  return (
                    <div 
                      key={reminder.id} 
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                        reminder.isDone 
                          ? 'bg-[var(--color-bg-secondary)] border-transparent opacity-60' 
                          : isOverdue 
                            ? 'bg-[var(--color-danger)]/5 border-[var(--color-danger)]/20'
                            : 'bg-[var(--color-card)] border-[var(--color-border)]'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleToggleReminder(reminder)}
                          className={`shrink-0 transition-colors ${reminder.isDone ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'}`}
                        >
                          {reminder.isDone ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                        </button>
                        
                        <div className="flex flex-col">
                          <span className={`font-semibold ${reminder.isDone ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text)]'}`}>
                            {reminder.title}
                          </span>
                          <span className={`text-xs font-medium flex items-center gap-1 ${reminder.isDone ? 'text-[var(--color-text-muted)]' : getReminderStatusColor(dueDate)}`}>
                            <CalendarIcon size={12} />
                            {isOverdue ? 'Vencida em ' : 'Vence em '}
                            {format(dueDate, "dd 'de' MMM", { locale: ptBR })}
                          </span>
                        </div>
                      </div>

                      {reminder.amount && (
                        <div className="shrink-0 text-right">
                          <span className={`font-bold ${reminder.isDone ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
                            {formatCurrency(reminder.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => activeTab === 'goals' ? setIsGoalFormOpen(true) : setIsReminderFormOpen(true)}
        className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:ml-[260px] w-14 h-14 bg-[var(--color-button)] text-white rounded-full shadow-lg shadow-[var(--color-button)]/30 flex items-center justify-center hover:scale-105 transition-transform z-40 focus:outline-none focus:ring-4 focus:ring-[var(--color-button)]/20"
        aria-label={activeTab === 'goals' ? 'Nova Meta' : 'Novo Lembrete'}
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      <GoalForm isOpen={isGoalFormOpen} onClose={() => setIsGoalFormOpen(false)} />
      <ReminderForm isOpen={isReminderFormOpen} onClose={() => setIsReminderFormOpen(false)} />
      
      {/* Transaction Form called from Reminders */}
      <TransactionForm 
        isOpen={isTransactionFormOpen} 
        onClose={() => setIsTransactionFormOpen(false)} 
        defaultType="expense"
      />
    </div>
  );
}

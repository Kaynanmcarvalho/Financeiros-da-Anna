import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowDownRight, ArrowUpRight, CreditCard, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

import { useAuth } from '@/providers/AuthProvider';
import { useDashboardData } from '@/hooks/useDashboard';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { getGreeting } from '@/utils/greeting';
import { formatCurrency } from '@/utils/currency';

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

export default function HomePage() {
  const { userProfile } = useAuth();
  const { totalBalance, monthlyIncome, monthlyExpense, recentTransactions, isLoading: isDashLoading } = useDashboardData();
  const { data: categories } = useCategories();
  const { data: accounts, isLoading: isAccountsLoading } = useAccounts();
  
  const isLoading = isDashLoading || isAccountsLoading;
  
  const preferences = usePreferencesStore((s) => s.preferences);
  const setPreferences = usePreferencesStore((s) => s.setPreferences);

  const greeting = getGreeting();
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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={userProfile?.photoURL} name={userProfile?.name} size="lg" />
          <div className="flex flex-col">
            <span className="text-sm text-[var(--color-text-secondary)]">{greeting},</span>
            <span className="font-bold text-lg text-[var(--color-text)] leading-tight">{userProfile?.name?.split(' ')[0]}</span>
          </div>
        </div>
        <button 
          onClick={toggleVisibility}
          className="p-2 rounded-full bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
          aria-label={isHidden ? "Mostrar valores" : "Ocultar valores"}
        >
          {isHidden ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </motion.div>

      {/* Saldo Geral Card */}
      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden p-6 border-none text-white shadow-lg shadow-[var(--color-primary)]/30" style={{ background: 'linear-gradient(135deg, var(--color-button) 0%, var(--color-primary) 100%)' }}>
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white rounded-full opacity-10 blur-xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-24 h-24 bg-black rounded-full opacity-5 blur-xl" />
          
          <div className="relative z-10 flex flex-col gap-1">
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

      {/* Contas e Cartões Carrossel */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-[var(--color-text)]">Minhas Contas</h3>
          <Link to="/perfil" className="text-xs font-semibold text-[var(--color-primary)]">Gerenciar</Link>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x" style={{ margin: '0 -16px', padding: '0 16px', scrollbarWidth: 'none' }}>
          {accounts?.filter(a => !a.archived).map((account) => (
            <Card key={account.id} className="min-w-[140px] p-4 flex flex-col gap-3 shrink-0 snap-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: account.color }}>
                  <LucideIcon name={account.icon} size={16} />
                </div>
                <span className="font-semibold text-sm truncate">{account.name}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[var(--color-text-secondary)] uppercase font-semibold tracking-wider">
                  {account.type === 'credit_card' ? 'Fatura' : 'Saldo'}
                </span>
                <span className={`font-bold ${account.type === 'credit_card' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text)]'}`}>
                  {renderHidden(formatCurrency(account.initialBalance))}
                </span>
              </div>
            </Card>
          ))}
          
          <Link to="/perfil" className="min-w-[120px] p-4 flex flex-col items-center justify-center gap-2 shrink-0 snap-center border-2 border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors">
            <PlusCircle size={24} />
            <span className="text-xs font-semibold text-center">Nova Conta</span>
          </Link>
        </div>
      </motion.div>

      {/* Transações Recentes */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-[var(--color-text)]">Últimos Lançamentos</h3>
          {recentTransactions.length > 0 && (
            <Link to="/lancamentos" className="text-sm text-[var(--color-button)] font-medium hover:underline">
              Ver tudo
            </Link>
          )}
        </div>

        {recentTransactions.length === 0 ? (
          <EmptyState
            icon={<CreditCard size={32} />}
            title="Nenhum lançamento recente"
            description="Você ainda não registrou nada neste mês."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {recentTransactions.map((tx) => {
              const isTransfer = tx.type === 'transfer';
              const cat = isTransfer ? { name: 'Transferência', icon: 'ArrowRightLeft', color: 'var(--color-info)' } : getCategoryDetails(tx.categoryId);
              
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      <LucideIcon name={cat.icon} size={20} />
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-[var(--color-text)] truncate text-sm">{tx.description}</span>
                      <span className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                        {format(tx.date.toDate(), "dd 'de' MMM", { locale: ptBR })}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2 text-right">
                    <span className={`font-semibold text-sm ${!isHidden ? (tx.type === 'expense' ? 'text-[var(--color-danger)]' : tx.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]') : 'text-[var(--color-text)]'}`}>
                      {isHidden ? '••••••' : `${tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}${formatCurrency(tx.amount)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {recentTransactions.length === 0 && (
          <Link to="/lancamentos">
            <Button variant="outline" fullWidth className="mt-2 border-dashed">
              Fazer meu primeiro lançamento
            </Button>
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Search, Download, BarChart3, RefreshCw, TriangleAlert } from 'lucide-react';

import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useAccounts } from '@/hooks/useAccounts';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { formatCurrency } from '@/utils/currency';
import type { CategoryType } from '@/types';

import { MonthSelector } from '@/components/transactions/MonthSelector';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { LucideIcon } from '@/components/ui/IconPicker';
import { Card } from '@/components/ui/Card';

export default function ReportsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);
  const hideValues = usePreferencesStore((s) => s.preferences.hideValues);

  const {
    data: transactions,
    isLoading: isTxLoading,
    isError: isTxError,
    error: txError,
    refetch: refetchTransactions,
  } = useTransactions(
    currentDate.getMonth(),
    currentDate.getFullYear()
  );
  const {
    data: categories,
    isLoading: isCatLoading,
    isError: isCatError,
    error: catError,
    refetch: refetchCategories,
  } = useCategories();
  const { data: accounts } = useAccounts();

  const isLoading = isTxLoading || isCatLoading;
  const hasLoadError = isTxError || isCatError;
  const loadError = txError ?? catError;

  const handleRetry = () => {
    void Promise.all([refetchTransactions(), refetchCategories()]);
  };

  // Process data for charts
  const { chartData, totalAmount } = useMemo(() => {
    if (!transactions || !categories) return { chartData: [], totalAmount: 0 };

    const filteredTxs = transactions.filter(tx => tx.type === activeTab);
    
    // Group by category
    const categoryTotals = new Map<string, number>();
    let total = 0;

    filteredTxs.forEach(tx => {
      total += tx.amount;
      const current = categoryTotals.get(tx.categoryId) || 0;
      categoryTotals.set(tx.categoryId, current + tx.amount);
    });

    // Format for Recharts
    const data = Array.from(categoryTotals.entries())
      .map(([categoryId, amount]) => {
        const cat = categories.find(c => c.id === categoryId);
        return {
          id: categoryId,
          name: cat?.name || 'Desconhecido',
          color: cat?.color || '#94a3b8',
          icon: cat?.icon || 'Tag',
          amount,
          percent: total > 0 ? (amount / total) * 100 : 0
        };
      })
      .sort((a, b) => b.amount - a.amount); // Sort by largest amount

    return { chartData: data, totalAmount: total };
  }, [transactions, categories, activeTab]);

  const handleExportCSV = () => {
    if (!transactions) return;
    
    // Header
    const csvRows = ['Data,Tipo,Categoria,Valor,Conta,Descrição'];
    
    transactions.forEach(tx => {
      const cat = categories?.find(c => c.id === tx.categoryId)?.name || 'Sem Categoria';
      const typeStr = tx.type === 'expense' ? 'Despesa' : tx.type === 'income' ? 'Receita' : 'Transferência';
      const valStr = (tx.amount / 100).toFixed(2).replace('.', ',');
      const dateStr = new Date(tx.date.toMillis()).toLocaleDateString('pt-BR');
      const accountName = tx.accountId
        ? (accounts?.find(a => a.id === tx.accountId)?.name || 'Conta apagada')
        : 'Dinheiro Vivo';
      // Escape description if it has commas
      const desc = `"${tx.description.replace(/"/g, '""')}"`;
      
      csvRows.push(`${dateStr},${typeStr},${cat},"${valStr}",${accountName},${desc}`);
    });
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_meu_dinheiro_${currentDate.getMonth()+1}_${currentDate.getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[var(--color-card)] p-3 rounded-xl border border-[var(--color-border)] shadow-lg flex flex-col gap-1">
          <span className="font-semibold text-sm text-[var(--color-text)] flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
            {data.name}
          </span>
          <span className="font-bold text-lg" style={{ color: data.color }}>
            {hideValues ? '••••••' : formatCurrency(data.amount)}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">
            {data.percent.toFixed(1)}% do total
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page mx-auto flex min-w-0 max-w-2xl flex-col gap-5 overflow-x-hidden pb-24">
      <section className="relative overflow-hidden rounded-[28px] border border-[var(--color-chart-3)]/25 bg-gradient-to-br from-[var(--color-chart-3)]/15 via-[var(--surface-raised)] to-[var(--color-accent)]/15 p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--color-chart-3)]/15 blur-2xl" />
        <div className="relative flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-chart-3)] to-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-chart-3)]/20">
            <BarChart3 size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-info)]">Inteligência financeira</span>
            <h1 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">Meus relatórios</h1>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">Entenda para onde vai seu dinheiro e tome decisões com mais confiança.</p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <div className="min-w-0 rounded-2xl border border-[var(--color-border)]/70 bg-[var(--surface-elevated)]/85 p-3 backdrop-blur-sm">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Total analisado</span>
            <strong className={`mt-1 block min-w-0 break-all text-base font-extrabold sm:text-lg ${activeTab === 'expense' ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
              {hideValues ? '••••••' : formatCurrency(totalAmount)}
            </strong>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[var(--surface-elevated)]/85 p-3 backdrop-blur-sm">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Categorias</span>
            <strong className="mt-1 block text-2xl font-extrabold text-[var(--color-text)]">{chartData.length}</strong>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={isLoading || !transactions?.length}
          className="relative mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--color-chart-3)] to-[var(--color-accent)] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-[var(--color-chart-3)]/20 transition-all hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-chart-3)]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={18} /> Exportar relatório
        </button>
      </section>

      <div className="sticky top-0 z-10 -mx-4 flex flex-col gap-3 border-y border-[var(--border-subtle)] bg-[var(--surface-nav)] px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />
        <Tabs 
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v as CategoryType)}
          tabs={[
            { value: 'expense', label: 'Despesas' },
            { value: 'income', label: 'Receitas' }
          ]} 
        />
      </div>

      {hasLoadError ? (
        <Card
          role="alert"
          className="flex flex-col items-center gap-4 rounded-[24px] border border-[var(--color-danger)]/25 bg-[var(--surface-raised)] p-6 text-center shadow-[var(--shadow-soft)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
            <TriangleAlert size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[var(--color-text)]">Não foi possível carregar o relatório</h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
              Verifique sua conexão e tente novamente. Seus lançamentos continuam seguros.
            </p>
            {import.meta.env.DEV && loadError instanceof Error && (
              <p className="mt-2 break-words text-xs text-[var(--color-text-muted)]">{loadError.message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-button)] px-4 py-3 text-sm font-extrabold text-white transition-all hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-[var(--color-button)]/20"
          >
            <RefreshCw size={18} aria-hidden="true" /> Tentar novamente
          </button>
        </Card>
      ) : isLoading ? (
        <div className="flex flex-col gap-6" aria-label="Carregando relatório">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : chartData.length === 0 ? (
        <EmptyState
          icon={<Search size={40} />}
          title="Sem dados para análise"
          description={`Você não possui ${activeTab === 'expense' ? 'despesas' : 'receitas'} cadastradas neste mês.`}
        />
      ) : (
        <motion.div
          initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-6"
        >
          {/* Chart Card */}
          <Card className="relative flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="amount"
                    stroke="none"
                    isAnimationActive={animationsEnabled}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={renderTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Center Total */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none mt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">Total</span>
              <span className={`text-xl font-bold ${activeTab === 'expense' ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                {hideValues ? '••••••' : formatCurrency(totalAmount)}
              </span>
            </div>
          </Card>

          {/* Breakdown List */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-lg text-[var(--color-text)] ml-1">Detalhamento</h3>
            
            {chartData.map((item) => (
              <Card key={item.id} className="group flex min-w-0 flex-col gap-3 overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4 shadow-[var(--shadow-soft)] transition-all hover:border-[var(--color-button)]/20 sm:p-5">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-110"
                      style={{ backgroundColor: item.color }}
                    >
                      <LucideIcon name={item.icon} size={20} />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="break-words font-semibold text-[var(--color-text)]">{item.name}</span>
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">{item.percent.toFixed(1)}%</span>
                    </div>
                  </div>
                  <span className="max-w-[45%] shrink-0 break-all text-right font-bold text-[var(--color-text)]">
                    {hideValues ? '••••••' : formatCurrency(item.amount)}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }} 
                  />
                </div>
              </Card>
            ))}
          </div>

        </motion.div>
      )}
    </div>
  );
}

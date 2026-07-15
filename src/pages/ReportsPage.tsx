import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Search, Download } from 'lucide-react';

import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { formatCurrency } from '@/utils/currency';
import type { CategoryType } from '@/types';

import { MonthSelector } from '@/components/transactions/MonthSelector';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { LucideIcon } from '@/components/ui/IconPicker';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ReportsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);
  const hideValues = usePreferencesStore((s) => s.preferences.hideValues);

  const { data: transactions, isLoading: isTxLoading } = useTransactions(
    currentDate.getMonth(),
    currentDate.getFullYear()
  );
  const { data: categories, isLoading: isCatLoading } = useCategories();

  const isLoading = isTxLoading || isCatLoading;

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
      // Escape description if it has commas
      const desc = `"${tx.description.replace(/"/g, '""')}"`;
      
      csvRows.push(`${dateStr},${typeStr},${cat},"${valStr}",${tx.accountId || 'Dinheiro Vivo'},${desc}`);
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
    <div className="page max-w-2xl mx-auto flex flex-col gap-6 pb-24">
      <div className="sticky top-0 z-10 bg-[var(--color-bg)] pt-2 pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 flex flex-col gap-4">
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

      {isLoading ? (
        <div className="flex flex-col gap-6">
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
          <Card className="p-4 flex flex-col items-center justify-center relative">
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
              <Card key={item.id} className="p-4 flex flex-col gap-3 group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-110"
                      style={{ backgroundColor: item.color }}
                    >
                      <LucideIcon name={item.icon} size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--color-text)]">{item.name}</span>
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">{item.percent.toFixed(1)}%</span>
                    </div>
                  </div>
                  <span className="font-bold text-[var(--color-text)]">
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
          {/* Botão Exportar */}
          <Button variant="outline" className="w-full mt-4" onClick={handleExportCSV}>
            <Download size={18} className="mr-2" /> Exportar para CSV
          </Button>
        </motion.div>
      )}
    </div>
  );
}

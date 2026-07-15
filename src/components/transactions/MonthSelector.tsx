import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthSelectorProps {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export function MonthSelector({ currentDate, onChange }: MonthSelectorProps) {
  const handlePrev = () => onChange(subMonths(currentDate, 1));
  const handleNext = () => onChange(addMonths(currentDate, 1));
  const handleCurrent = () => onChange(new Date());

  const isCurrentMonth = 
    currentDate.getMonth() === new Date().getMonth() && 
    currentDate.getFullYear() === new Date().getFullYear();

  return (
    <div className="flex items-center justify-between bg-[var(--color-card)] p-2 rounded-2xl border border-[var(--color-border)] shadow-sm">
      <button
        onClick={handlePrev}
        className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={handleCurrent}
        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors"
      >
        <CalendarIcon size={16} className={isCurrentMonth ? 'text-[var(--color-button)]' : 'text-[var(--color-text-muted)]'} />
        <span className="font-semibold text-[var(--color-text)] capitalize text-sm">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </span>
      </button>

      <button
        onClick={handleNext}
        className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] transition-colors"
        aria-label="Mês seguinte"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

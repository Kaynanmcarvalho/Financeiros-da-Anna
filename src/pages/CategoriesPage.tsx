import { ArrowLeft, Tags } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategoryManager } from '@/components/finance/CategoryManager';

export default function CategoriesPage() {
  return (
    <div className="page mx-auto flex min-w-0 max-w-2xl flex-col gap-4 pb-24">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to="/"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
          aria-label="Voltar ao início"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex min-w-0 flex-col">
          <span className="flex items-center gap-2 text-xl font-bold text-[var(--color-text)]"><Tags size={21} /> Categorias</span>
          <span className="text-sm text-[var(--color-text-secondary)]">Organize receitas e despesas.</span>
        </div>
      </div>

      <div className="min-w-0 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm sm:p-6">
        <CategoryManager />
      </div>
    </div>
  );
}
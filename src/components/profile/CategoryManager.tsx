import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Trash2, Tag, Lock } from 'lucide-react';

import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useUIStore } from '@/stores/uiStore';
import { categorySchema, type CategoryFormData } from '@/validators/schemas';
import type { Category, CategoryType } from '@/types';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { IconPicker, LucideIcon } from '@/components/ui/IconPicker';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export function CategoryManager() {
  const { data: categories, isLoading } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();
  const openConfirmDialog = useUIStore((s) => s.openConfirmDialog);
  const addToast = useUIStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const filteredCategories = categories?.filter((c) => c.type === activeTab) || [];

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    if (category.isDefault) {
      addToast({ type: 'warning', title: 'Ação não permitida', description: 'Categorias padrão não podem ser excluídas.' });
      return;
    }

    openConfirmDialog({
      title: 'Excluir Categoria?',
      description: `Tem certeza que deseja excluir a categoria "${category.name}"? Isso pode afetar relatórios de lançamentos antigos.`,
      variant: 'danger',
      onConfirm: () => deleteCategoryMutation.mutate(category.id),
    });
  };

  if (isLoading) {
    return <SkeletonList count={4} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg text-[var(--color-text)]">Categorias</h3>
        <Button size="sm" onClick={handleOpenCreate} icon={<Plus size={16} />}>
          Nova Categoria
        </Button>
      </div>

      <Tabs 
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v as CategoryType)}
        tabs={[
          { value: 'expense', label: 'Despesas' },
          { value: 'income', label: 'Receitas' }
        ]} 
        className="mb-2"
      />

      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={<Tag size={40} />}
          title="Nenhuma categoria"
          description={`Você ainda não tem categorias de ${activeTab === 'expense' ? 'despesa' : 'receita'}.`}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredCategories.map((category) => (
            <div 
              key={category.id} 
              className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] transition-shadow hover:shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: category.color }}
                >
                  <LucideIcon name={category.icon} size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-[var(--color-text)] text-sm">{category.name}</span>
                  {category.isDefault && (
                    <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                      <Lock size={10} /> Padrão
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenEdit(category)}
                  className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-button)] transition-colors"
                  aria-label="Editar"
                >
                  <Edit2 size={16} />
                </button>
                {!category.isDefault && (
                  <button 
                    onClick={() => handleDelete(category)}
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                    aria-label="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CategoryModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          category={editingCategory}
          defaultType={activeTab}
        />
      )}
    </div>
  );
}

function CategoryModal({ isOpen, onClose, category, defaultType }: { isOpen: boolean, onClose: () => void, category: Category | null, defaultType: CategoryType }) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category ? {
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
    } : {
      name: '',
      type: defaultType,
      color: '#4ADE80',
      icon: 'Tag',
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
        });
      } else {
        reset({
          name: '',
          type: defaultType,
          color: '#4ADE80',
          icon: 'Tag',
        });
      }
    }
  }, [isOpen, category, defaultType, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (category) {
        await updateMutation.mutateAsync({ id: category.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (e) {
      console.error("Erro ao submeter categoria:", e);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Editar Categoria' : 'Nova Categoria'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        
        {/* If default category, name and type cannot be changed */}
        {!category?.isDefault ? (
          <>
            <Tabs 
              activeTab={watch('type')}
              onTabChange={(v) => reset({ ...watch(), type: v as CategoryType })}
              tabs={[
                { value: 'expense', label: 'Despesa' },
                { value: 'income', label: 'Receita' }
              ]} 
              className="mb-2"
            />
            <Input
              label="Nome da categoria"
              placeholder="Ex: Supermercado..."
              error={errors.name?.message}
              {...register('name')}
            />
          </>
        ) : (
          <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg flex items-center justify-between border border-[var(--color-border)]">
            <div>
              <p className="text-sm font-medium">{category.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Categoria Padrão do Sistema</p>
            </div>
            <Lock size={16} className="text-[var(--color-text-muted)]" />
          </div>
        )}

        <div className="pt-2">
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <ColorPicker
                label="Cor Principal"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="pt-2 border-t border-[var(--color-border)]">
          <p className="input-label mb-2">Ícone</p>
          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <IconPicker
                value={field.value}
                onChange={field.onChange}
                color={watch('color')}
              />
            )}
          />
          {errors.icon && <p className="input-error mt-1">{errors.icon.message}</p>}
        </div>

        <div className="flex gap-3 mt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={isLoading} className="flex-1">
            {category ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

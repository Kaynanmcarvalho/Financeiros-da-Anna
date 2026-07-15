import { z } from 'zod';

// ==========================================
// Auth Schemas
// ==========================================

export const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ==========================================
// Account Schema
// ==========================================

export const accountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  type: z.enum(['credit_card', 'debit_card', 'wallet', 'bank_account', 'pix']),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  creditLimit: z.number().int().min(0).nullable(),
  closingDay: z.number().int().min(1).max(31).nullable(),
  dueDay: z.number().int().min(1).max(31).nullable(),
  initialBalance: z.number().int(),
  archived: z.boolean(),
});

export type AccountFormData = z.infer<typeof accountSchema>;

// ==========================================
// Category Schema
// ==========================================

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(30, 'Nome muito longo'),
  type: z.enum(['income', 'expense']),
  color: z.string(),
  icon: z.string().min(1, 'Ícone é obrigatório'),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// ==========================================
// Transaction Schema
// ==========================================

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'transfer']),
  amount: z.number().int().min(1, 'Valor deve ser maior que zero'),
  description: z.string().min(1, 'Descrição é obrigatória').max(100, 'Descrição muito longa'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  accountId: z.string().nullable(),
  toAccountId: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  isPaid: z.boolean(),
  isRecurring: z.boolean(),
  recurrenceRule: z.enum(['monthly', 'weekly', 'yearly']).nullable(),
  installments: z
    .object({
      current: z.number().int().min(1),
      total: z.number().int().min(2, 'Mínimo 2 parcelas').max(360, 'Máximo 360 parcelas'),
    })
    .nullable(),
  notes: z.string().max(500, 'Observação muito longa').nullable(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

// ==========================================
// Goal Schema
// ==========================================

export const goalSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(50, 'Título muito longo'),
  targetAmount: z.number().int().min(1, 'Valor alvo é obrigatório'),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
});

export type GoalFormData = z.infer<typeof goalSchema>;

// ==========================================
// Reminder Schema
// ==========================================

export const reminderSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  amount: z.number().int().min(0).nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  recurrence: z.enum(['none', 'monthly', 'weekly', 'yearly']),
  linkedAccountId: z.string().nullable(),
  notifyDaysBefore: z.number().int().min(0).max(30),
});

export type ReminderFormData = z.infer<typeof reminderSchema>;

// ==========================================
// Budget Schema
// ==========================================

export const budgetLimitSchema = z.object({
  categoryId: z.string().min(1),
  limit: z.number().int().min(0, 'Limite deve ser positivo'),
});

export const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato inválido (YYYY-MM)'),
  limits: z.array(budgetLimitSchema),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

// ==========================================
// Profile Schemas
// ==========================================

export const updateNameSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
});

export type UpdateNameFormData = z.infer<typeof updateNameSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    confirmNewPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmNewPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

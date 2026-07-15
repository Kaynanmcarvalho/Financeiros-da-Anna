import type { UserPreferences, ThemePreset, Category } from '@/types';

export const APP_NAME = 'Meu Dinheiro';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  primaryColor: '#F9D5E5',
  buttonColor: '#E891B9',
  cardColor: '#FFF0F5',
  accentColor: '#D4A5C7',
  bottomBarColor: '#FFFFFF',
  chartPalette: ['#E891B9', '#D4A5C7', '#A8D8EA', '#B5EAD7', '#FFD6A5', '#FDCFE8', '#C3B1E1', '#F7DC6F'],
  fontSize: 'md',
  borderRadius: 'lg',
  animationsEnabled: true,
  hideValues: false,
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Rosa Pastel',
    preferences: {
      primaryColor: '#F9D5E5',
      buttonColor: '#E891B9',
      cardColor: '#FFF0F5',
      accentColor: '#D4A5C7',
      bottomBarColor: '#FFFFFF',
      chartPalette: ['#E891B9', '#D4A5C7', '#A8D8EA', '#B5EAD7', '#FFD6A5', '#FDCFE8', '#C3B1E1', '#F7DC6F'],
    },
  },
  {
    name: 'Lilás',
    preferences: {
      primaryColor: '#E8D5F5',
      buttonColor: '#B088C9',
      cardColor: '#F5F0FA',
      accentColor: '#9B72B0',
      bottomBarColor: '#FFFFFF',
      chartPalette: ['#B088C9', '#9B72B0', '#D4A5E8', '#A8D8EA', '#FFD6A5', '#C3B1E1', '#E891B9', '#B5EAD7'],
    },
  },
  {
    name: 'Céu',
    preferences: {
      primaryColor: '#D5E8F5',
      buttonColor: '#88B0C9',
      cardColor: '#F0F5FA',
      accentColor: '#7298B0',
      bottomBarColor: '#FFFFFF',
      chartPalette: ['#88B0C9', '#7298B0', '#A8D8EA', '#B5EAD7', '#FFD6A5', '#E891B9', '#C3B1E1', '#F7DC6F'],
    },
  },
  {
    name: 'Menta',
    preferences: {
      primaryColor: '#D5F5E8',
      buttonColor: '#88C9B0',
      cardColor: '#F0FAF5',
      accentColor: '#72B098',
      bottomBarColor: '#FFFFFF',
      chartPalette: ['#88C9B0', '#72B098', '#B5EAD7', '#A8D8EA', '#FFD6A5', '#E891B9', '#C3B1E1', '#F7DC6F'],
    },
  },
  {
    name: 'Escuro Suave',
    preferences: {
      primaryColor: '#2D2433',
      buttonColor: '#E891B9',
      cardColor: '#1E1A23',
      accentColor: '#D4A5C7',
      bottomBarColor: '#1E1A23',
      chartPalette: ['#E891B9', '#D4A5C7', '#A8D8EA', '#B5EAD7', '#FFD6A5', '#FDCFE8', '#C3B1E1', '#F7DC6F'],
    },
  },
];

export type DefaultCategoryData = Omit<Category, 'id' | 'createdAt'>;

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategoryData[] = [
  { name: 'Alimentação', type: 'expense', color: '#FF9B9B', icon: 'UtensilsCrossed', isDefault: true },
  { name: 'Transporte', type: 'expense', color: '#88B0C9', icon: 'Car', isDefault: true },
  { name: 'Moradia', type: 'expense', color: '#C3B1E1', icon: 'Home', isDefault: true },
  { name: 'Saúde', type: 'expense', color: '#B5EAD7', icon: 'Heart', isDefault: true },
  { name: 'Lazer', type: 'expense', color: '#FFD6A5', icon: 'Gamepad2', isDefault: true },
  { name: 'Educação', type: 'expense', color: '#A8D8EA', icon: 'GraduationCap', isDefault: true },
  { name: 'Assinaturas', type: 'expense', color: '#FDCFE8', icon: 'CreditCard', isDefault: true },
  { name: 'Outros', type: 'expense', color: '#D4D4D8', icon: 'MoreHorizontal', isDefault: true },
];

export const DEFAULT_INCOME_CATEGORIES: DefaultCategoryData[] = [
  { name: 'Salário', type: 'income', color: '#B5EAD7', icon: 'Banknote', isDefault: true },
  { name: 'Freelance', type: 'income', color: '#A8D8EA', icon: 'Laptop', isDefault: true },
  { name: 'Investimentos', type: 'income', color: '#FFD6A5', icon: 'TrendingUp', isDefault: true },
  { name: 'Outros', type: 'income', color: '#D4D4D8', icon: 'MoreHorizontal', isDefault: true },
];

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  wallet: 'Carteira',
  bank_account: 'Conta Bancária',
  pix: 'Pix',
};

export const FONT_SIZE_MAP: Record<string, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
};

export const BORDER_RADIUS_MAP: Record<string, string> = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
};

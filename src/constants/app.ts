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
      theme: 'light',
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
      theme: 'light',
      primaryColor: '#E8D5F5',
      buttonColor: '#9A6BB5',
      cardColor: '#F5F0FA',
      accentColor: '#9B72B0',
      bottomBarColor: '#FFFFFF',
      chartPalette: ['#9A6BB5', '#9B72B0', '#D4A5E8', '#A8D8EA', '#FFD6A5', '#C3B1E1', '#E891B9', '#B5EAD7'],
    },
  },
  {
    name: 'Céu',
    preferences: {
      theme: 'light',
      primaryColor: '#D5E8F5',
      buttonColor: '#527F9B',
      cardColor: '#F0F5FA',
      accentColor: '#7298B0',
      bottomBarColor: '#FFFFFF',
      chartPalette: ['#527F9B', '#7298B0', '#A8D8EA', '#B5EAD7', '#FFD6A5', '#E891B9', '#C3B1E1', '#F7DC6F'],
    },
  },
  {
    name: 'Menta',
    preferences: {
      theme: 'light',
      primaryColor: '#D5F5E8',
      buttonColor: '#3F8F72',
      cardColor: '#F0FAF5',
      accentColor: '#72B098',
      bottomBarColor: '#FFFFFF',
      chartPalette: ['#3F8F72', '#72B098', '#B5EAD7', '#A8D8EA', '#FFD6A5', '#E891B9', '#C3B1E1', '#F7DC6F'],
    },
  },
  {
    name: 'Laranja',
    preferences: {
      theme: 'light',
      primaryColor: '#FFE1CC',
      buttonColor: '#C65D16',
      cardColor: '#FFF7F0',
      accentColor: '#F4A261',
      bottomBarColor: '#FFFFFF',
      chartPalette: ['#C65D16', '#F4A261', '#FFB074', '#E76F51', '#F6BD60', '#84A59D', '#88B0C9', '#B088C9'],
    },
  },
  {
    name: 'Amarelo',
    preferences: {
      theme: 'light',
      primaryColor: '#FFF3BF',
      buttonColor: '#9A6700',
      cardColor: '#FFFBEB',
      accentColor: '#D4A72C',
      bottomBarColor: '#FFFFFF',
      chartPalette: ['#9A6700', '#D4A72C', '#F2CC60', '#FFE08A', '#E9C46A', '#F4A261', '#84A59D', '#88B0C9'],
    },
  },
  {
    name: 'Marrom Pastel',
    preferences: {
      theme: 'light',
      primaryColor: '#E7D3C4',
      buttonColor: '#815B47',
      cardColor: '#FBF7F3',
      accentColor: '#B98F73',
      bottomBarColor: '#FFFDFC',
      chartPalette: ['#815B47', '#B98F73', '#D5B59F', '#A68A7B', '#D8A48F', '#C7B198', '#8FA6A0', '#B48EAD'],
    },
  },
  {
    name: 'Azul Turquesa',
    preferences: {
      theme: 'light',
      primaryColor: '#C9F0EA',
      buttonColor: '#287A75',
      cardColor: '#F2FBFA',
      accentColor: '#63B7AD',
      bottomBarColor: '#FCFFFF',
      chartPalette: ['#287A75', '#63B7AD', '#8DD3CA', '#A8E6CF', '#67B7C7', '#84A9C0', '#E0B1CB', '#F2CC8F'],
    },
  },
  {
    name: 'Rosa Antigo',
    preferences: {
      theme: 'light',
      primaryColor: '#E9CFD4',
      buttonColor: '#945765',
      cardColor: '#FBF5F6',
      accentColor: '#BE8792',
      bottomBarColor: '#FFFCFD',
      chartPalette: ['#945765', '#BE8792', '#D6A6AE', '#E8C2C8', '#B784A7', '#9F8FB5', '#8DA8A1', '#D5B37A'],
    },
  },
  {
    name: 'Amarelo Giz',
    preferences: {
      theme: 'light',
      primaryColor: '#FFF3C4',
      buttonColor: '#80621B',
      cardColor: '#FFFBEF',
      accentColor: '#D1B75B',
      bottomBarColor: '#FFFFFC',
      chartPalette: ['#80621B', '#D1B75B', '#E8D587', '#F5E6A8', '#D9A86C', '#A7B88A', '#83A6B4', '#B79BC8'],
    },
  },
  {
    name: 'Pantone Pastel',
    preferences: {
      theme: 'light',
      primaryColor: '#DCD7F7',
      buttonColor: '#625E9E',
      cardColor: '#F7F5FD',
      accentColor: '#9B91D1',
      bottomBarColor: '#FEFDFF',
      chartPalette: ['#625E9E', '#9B91D1', '#B8AFE5', '#CFC8EF', '#8DB3C7', '#83B5A5', '#E1A6B8', '#E7C57A'],
    },
  },
  {
    name: 'Vermelho Pastel',
    preferences: {
      theme: 'light',
      primaryColor: '#F7D1D1',
      buttonColor: '#A9444E',
      cardColor: '#FFF5F5',
      accentColor: '#D77A81',
      bottomBarColor: '#FFFCFC',
      chartPalette: ['#A9444E', '#D77A81', '#E6A0A5', '#F2BFC2', '#D98C70', '#C5A267', '#78A39A', '#879DB8'],
    },
  },
  {
    name: 'Escuro Suave',
    preferences: {
      theme: 'dark',
      primaryColor: '#F3C5DB',
      buttonColor: '#E891B9',
      cardColor: '#211C25',
      accentColor: '#C995B8',
      bottomBarColor: '#1E1A23',
      chartPalette: ['#E891B9', '#C995B8', '#8FC7DD', '#8DD2B5', '#F0B27A', '#F5B8D5', '#B9A4DB', '#E9CF69'],
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

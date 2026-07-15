import { create } from 'zustand';

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface UIState {
  hideValues: boolean;
  toggleHideValues: () => void;
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: (() => void) | null;
  };
  openConfirmDialog: (opts: {
    title: string;
    description: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }) => void;
  closeConfirmDialog: () => void;
}

let toastCounter = 0;

export const useUIStore = create<UIState>((set) => ({
  hideValues: false,
  toggleHideValues: () => set((state) => ({ hideValues: !state.hideValues })),

  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    const duration = toast.duration ?? 4000;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  confirmDialog: {
    isOpen: false,
    title: '',
    description: '',
    variant: 'danger',
    onConfirm: null,
  },
  openConfirmDialog: ({ title, description, variant = 'danger', onConfirm }) =>
    set({
      confirmDialog: { isOpen: true, title, description, variant, onConfirm },
    }),
  closeConfirmDialog: () =>
    set({
      confirmDialog: {
        isOpen: false,
        title: '',
        description: '',
        variant: 'danger',
        onConfirm: null,
      },
    }),
}));

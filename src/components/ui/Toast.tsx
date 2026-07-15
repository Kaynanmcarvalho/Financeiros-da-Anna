import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function Toast() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);
  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];

          return (
            <motion.div
              key={toast.id}
              className={`toast toast-${toast.type}`}
              role="alert"
              initial={animationsEnabled ? { opacity: 0, y: -20, scale: 0.95 } : undefined}
              animate={animationsEnabled ? { opacity: 1, y: 0, scale: 1 } : undefined}
              exit={animationsEnabled ? { opacity: 0, y: -20, scale: 0.95 } : undefined}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Icon size={18} className="toast-icon" />
              <div className="toast-body">
                <p className="toast-title">{toast.title}</p>
                {toast.description && (
                  <p className="toast-description">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="toast-close"
                aria-label="Fechar notificação"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

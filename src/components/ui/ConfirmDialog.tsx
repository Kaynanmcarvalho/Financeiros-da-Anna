import { AlertTriangle, X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreferencesStore } from '@/stores/preferencesStore';

export function ConfirmDialog() {
  const { isOpen, title, description, variant, onConfirm } = useUIStore(
    (s) => s.confirmDialog
  );
  const closeConfirmDialog = useUIStore((s) => s.closeConfirmDialog);
  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);

  const handleConfirm = () => {
    onConfirm?.();
    closeConfirmDialog();
  };

  const variantColors = {
    danger: 'confirm-danger',
    warning: 'confirm-warning',
    info: 'confirm-info',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay-container">
          <motion.div
            className="modal-backdrop"
            initial={animationsEnabled ? { opacity: 0 } : undefined}
            animate={animationsEnabled ? { opacity: 1 } : undefined}
            exit={animationsEnabled ? { opacity: 0 } : undefined}
            onClick={closeConfirmDialog}
            aria-hidden="true"
          />
          <motion.div
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            initial={animationsEnabled ? { opacity: 0, scale: 0.95 } : undefined}
            animate={animationsEnabled ? { opacity: 1, scale: 1 } : undefined}
            exit={animationsEnabled ? { opacity: 0, scale: 0.95 } : undefined}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={closeConfirmDialog}
              className="confirm-close"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            <div className={`confirm-icon-wrapper ${variantColors[variant]}`}>
              <AlertTriangle size={28} />
            </div>

            <h3 className="confirm-title">{title}</h3>
            <p className="confirm-description">{description}</p>

            <div className="confirm-actions">
              <Button variant="ghost" onClick={closeConfirmDialog}>
                Cancelar
              </Button>
              <Button
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={handleConfirm}
              >
                Confirmar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

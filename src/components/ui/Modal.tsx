import { useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferencesStore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay-container">
          <motion.div
            className="modal-backdrop"
            initial={animationsEnabled ? { opacity: 0 } : undefined}
            animate={animationsEnabled ? { opacity: 1 } : undefined}
            exit={animationsEnabled ? { opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className={`modal modal-${size}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={animationsEnabled ? { opacity: 0, scale: 0.95, y: 20 } : undefined}
            animate={animationsEnabled ? { opacity: 1, scale: 1, y: 0 } : undefined}
            exit={animationsEnabled ? { opacity: 0, scale: 0.95, y: 20 } : undefined}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {(title || showCloseButton) && (
              <div className="modal-header">
                {title && <h2 className="modal-title">{title}</h2>}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="modal-close"
                    aria-label="Fechar"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
            <div className="modal-content">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

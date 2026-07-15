import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePreferencesStore } from '@/stores/preferencesStore';

import { Toast } from '@/components/ui/Toast';

export function AuthLayout() {
  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);

  return (
    <div className="auth-layout">
      <div className="auth-layout-inner">
        <motion.div
          className="auth-logo-container"
          initial={animationsEnabled ? { opacity: 0, scale: 0.9 } : undefined}
          animate={animationsEnabled ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <img
            src="/logo.png"
            alt="Meu Dinheiro"
            className="auth-logo"
          />
        </motion.div>

        <motion.div
          className="auth-form-container"
          initial={animationsEnabled ? { opacity: 0, y: 20 } : undefined}
          animate={animationsEnabled ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </div>

      <Toast />
    </div>
  );
}

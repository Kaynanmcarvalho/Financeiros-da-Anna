import { motion } from 'framer-motion';
import { usePreferencesStore } from '@/stores/preferencesStore';
import logoSrc from '@/assets/logo.png';

export function PageLoader() {
  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);

  return (
    <div className="page-loader">
      {animationsEnabled ? (
        <motion.img
          src={logoSrc}
          alt="Carregando..."
          className="page-loader-logo"
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.95, 1, 0.95],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ) : (
        <img
          src={logoSrc}
          alt="Carregando..."
          className="page-loader-logo"
        />
      )}
    </div>
  );
}

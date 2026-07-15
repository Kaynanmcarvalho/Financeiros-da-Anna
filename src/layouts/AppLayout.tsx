import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PlusCircle, Target, Heart, Bell, BarChart3 } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { Toast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface NavItem {
  path: string;
  icon: typeof Home;
  label: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/lancar', icon: PlusCircle, label: 'Lançar' },
  { path: '/planejar', icon: Target, label: 'Planejar' },
  { path: '/desejos', icon: Heart, label: 'Desejos' },
  { path: '/lembretes', icon: Bell, label: 'Lembretes' },
  { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app-layout">
      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={animationsEnabled ? { opacity: 0, y: 8 } : undefined}
            animate={animationsEnabled ? { opacity: 1, y: 0 } : undefined}
            exit={animationsEnabled ? { opacity: 0, y: -8 } : undefined}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="page-container"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="bottom-nav" role="navigation" aria-label="Navegação principal">
        <div className="bottom-nav-inner">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`bottom-nav-item ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
              >
                <div className="bottom-nav-icon-wrapper">
                  {active && animationsEnabled && (
                    <motion.div
                      layoutId="bottomNavIndicator"
                      className="bottom-nav-indicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  {active && !animationsEnabled && (
                    <div className="bottom-nav-indicator" />
                  )}
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 1.8}
                    className="bottom-nav-icon"
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="bottom-nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                  )}
                </div>
                <span className="bottom-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <Toast />
      <ConfirmDialog />
    </div>
  );
}

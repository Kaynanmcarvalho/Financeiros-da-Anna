import { motion } from 'framer-motion';
import { usePreferencesStore } from '@/stores/preferencesStore';

interface Tab {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);

  return (
    <div className={`tabs ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            className={`tab ${isActive ? 'tab-active' : ''}`}
            onClick={() => onTabChange(tab.value)}
          >
            {isActive && animationsEnabled && (
              <motion.div
                layoutId="tabIndicator"
                className="tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            {isActive && !animationsEnabled && <div className="tab-indicator" />}
            {tab.icon && <span className="tab-icon mr-1">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

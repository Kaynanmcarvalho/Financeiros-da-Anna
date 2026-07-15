import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon as LucideIconType } from 'lucide-react';

const AVAILABLE_ICONS = [
  'Wallet', 'CreditCard', 'Banknote', 'Coins', 'PiggyBank',
  'UtensilsCrossed', 'Coffee', 'ShoppingCart', 'ShoppingBag', 'Store',
  'Car', 'Bus', 'Plane', 'Train', 'Bike',
  'Home', 'Building', 'Building2', 'Key', 'Wrench',
  'Heart', 'HeartPulse', 'Pill', 'Stethoscope', 'Activity',
  'Gamepad2', 'Music', 'Film', 'Tv', 'Popcorn',
  'GraduationCap', 'BookOpen', 'Pencil', 'School', 'Library',
  'Smartphone', 'Laptop', 'Monitor', 'Wifi', 'Globe',
  'TrendingUp', 'TrendingDown', 'BarChart3', 'LineChart', 'PieChart',
  'Gift', 'PartyPopper', 'Star', 'Sparkles', 'Trophy',
  'Dog', 'Cat', 'Baby', 'Users', 'User',
  'Droplets', 'Zap', 'Flame', 'Snowflake', 'Sun',
  'MoreHorizontal', 'Tag', 'Bookmark', 'Flag', 'Target',
] as const;

function getIconComponent(name: string): LucideIconType | null {
  const icons = LucideIcons as unknown as Record<string, LucideIconType | undefined>;
  return icons[name] ?? null;
}

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color = 'var(--color-accent)' }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = AVAILABLE_ICONS.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="icon-picker">
      <input
        type="text"
        placeholder="Buscar ícone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="icon-picker-search"
        aria-label="Buscar ícone"
      />
      <div className="icon-picker-grid">
        {filtered.map((iconName) => {
          const IconComp = getIconComponent(iconName);
          if (!IconComp) return null;

          const isSelected = value === iconName;

          return (
            <button
              key={iconName}
              type="button"
              className={`icon-picker-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onChange(iconName)}
              title={iconName}
              style={isSelected ? { backgroundColor: color, color: '#fff' } : undefined}
              aria-label={iconName}
              aria-pressed={isSelected}
            >
              <IconComp size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Render a Lucide icon by name.
 */
export function LucideIcon({
  name,
  size = 20,
  color: iconColor,
  className = '',
}: {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}) {
  const IconComp = getIconComponent(name);
  if (!IconComp) return null;
  return <IconComp size={size} color={iconColor} className={className} />;
}

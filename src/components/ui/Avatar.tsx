import { User } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export function Avatar({ src, name, size = 'md', onClick, className = '' }: AvatarProps) {
  const pixelSize = sizeMap[size];
  const initials = name ? getInitials(name) : '';

  return (
    <button
      type="button"
      className={`avatar avatar-${size} ${onClick ? 'avatar-clickable' : ''} ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      onClick={onClick}
      aria-label={name ? `Perfil de ${name}` : 'Perfil'}
      tabIndex={onClick ? 0 : -1}
    >
      {src ? (
        <img
          src={src}
          alt={name ?? 'Avatar'}
          className="avatar-img"
          loading="lazy"
        />
      ) : initials ? (
        <span className="avatar-initials">{initials}</span>
      ) : (
        <User size={pixelSize * 0.5} className="avatar-fallback-icon" />
      )}
    </button>
  );
}

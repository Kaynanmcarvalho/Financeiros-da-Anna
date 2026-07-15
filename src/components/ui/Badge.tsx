interface BadgeProps {
  count: number;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  className?: string;
}

export function Badge({ count, variant = 'default', className = '' }: BadgeProps) {
  if (count <= 0) return null;

  return (
    <span className={`badge badge-${variant} ${className}`} aria-label={`${count} itens`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferencesStore';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const animationsEnabled = usePreferencesStore((s) => s.preferences.animationsEnabled);
    const isDisabled = disabled || loading;

    const buttonClasses = `btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${isDisabled ? 'btn-disabled' : ''} ${className}`;

    const content = (
      <>
        {loading ? (
          <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="btn-spinner" />
        ) : icon ? (
          <span className="btn-icon">{icon}</span>
        ) : null}
        {children && <span className="btn-text">{children}</span>}
      </>
    );

    if (animationsEnabled) {
      return (
        <motion.button
          ref={ref}
          className={buttonClasses}
          disabled={isDisabled}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.15 }}
          {...props}
        >
          {content}
        </motion.button>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

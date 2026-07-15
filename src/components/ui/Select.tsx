import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, leftIcon, className = '', id, ...props }, ref) => {
    const selectId = id ?? `select-${label?.toLowerCase().replace(/\s/g, '-') ?? 'field'}`;

    return (
      <div className={`input-group ${error ? 'input-group-error' : ''} ${className}`}>
        {label && (
          <label htmlFor={selectId} className="input-label">
            {label}
          </label>
        )}
        <div className="input-wrapper">
          {leftIcon && <span className="input-icon input-icon-left">{leftIcon}</span>}
          <select
            ref={ref}
            id={selectId}
            className={`input-field select-field ${leftIcon ? 'input-has-left-icon' : ''}`}
            aria-invalid={!!error}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="input-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

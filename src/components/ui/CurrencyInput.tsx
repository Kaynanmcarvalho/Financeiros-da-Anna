import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { maskCurrencyInput } from '@/utils/currency';

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  value: number; // in cents
  onChange: (cents: number) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ label, error, value, onChange, className = '', id, ...props }, ref) => {
    const inputId = id ?? 'currency-input';
    const [displayValue, setDisplayValue] = useState(() => maskCurrencyInput(String(value)));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawDigits = e.target.value.replace(/\D/g, '');
      const cents = parseInt(rawDigits || '0', 10);
      setDisplayValue(maskCurrencyInput(rawDigits));
      onChange(cents);
    };

    return (
      <div className={`input-group ${error ? 'input-group-error' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="input-wrapper">
          <span className="input-icon input-icon-left currency-prefix">R$</span>
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="numeric"
            className="input-field input-has-left-icon currency-input"
            value={displayValue}
            onChange={handleChange}
            aria-invalid={!!error}
            {...props}
          />
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

CurrencyInput.displayName = 'CurrencyInput';

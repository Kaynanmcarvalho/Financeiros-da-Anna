import { forwardRef, type InputHTMLAttributes } from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? 'date-picker';

    return (
      <div className={`input-group ${error ? 'input-group-error' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className="input-wrapper">
          <span className="input-icon input-icon-left">
            <Calendar size={16} />
          </span>
          <input
            ref={ref}
            id={inputId}
            type="date"
            className="input-field input-has-left-icon"
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

DatePicker.displayName = 'DatePicker';

interface ProgressBarProps {
  value: number; // 0-100
  maxValue?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  colorMode?: 'auto' | 'custom';
  color?: string;
  className?: string;
}

export function ProgressBar({
  value,
  maxValue = 100,
  showPercentage = true,
  size = 'md',
  colorMode = 'auto',
  color,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / maxValue) * 100), 100);

  const getAutoColor = () => {
    if (percentage < 70) return 'var(--color-success)';
    if (percentage < 100) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const barColor = colorMode === 'custom' && color ? color : getAutoColor();

  return (
    <div className={`progress-bar-container progress-${size} ${className}`}>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
        />
      </div>
      {showPercentage && (
        <span className="progress-bar-label">{percentage}%</span>
      )}
    </div>
  );
}

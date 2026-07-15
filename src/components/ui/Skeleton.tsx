interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius,
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton height="24px" width="60%" />
      <Skeleton height="16px" width="80%" />
      <Skeleton height="16px" width="40%" />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <Skeleton width="40px" height="40px" borderRadius="50%" />
          <div className="skeleton-list-text">
            <Skeleton height="16px" width="70%" />
            <Skeleton height="14px" width="40%" />
          </div>
          <Skeleton width="60px" height="16px" />
        </div>
      ))}
    </div>
  );
}

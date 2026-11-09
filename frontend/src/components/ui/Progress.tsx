import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100+
  max?: number;
  indicatorClassName?: string;
  variant?: 'primary' | 'warning' | 'danger' | 'auto';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'auto',
  className,
  indicatorClassName,
  ...props
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  let colorClass = 'bg-emerald-500';
  if (variant === 'warning') colorClass = 'bg-amber-500';
  else if (variant === 'danger') colorClass = 'bg-rose-500';
  else if (variant === 'auto') {
    if (percentage >= 100) colorClass = 'bg-rose-500';
    else if (percentage >= 80) colorClass = 'bg-amber-500';
    else colorClass = 'bg-emerald-500';
  }

  return (
    <div
      className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className={cn('h-full w-full flex-1 transition-all duration-500 ease-out rounded-full', colorClass, indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};


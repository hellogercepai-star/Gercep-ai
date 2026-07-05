import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h3 className="font-[family-name:var(--font-display)] text-base font-semibold">
              {title}
            </h3>
          )}
          {action}
        </div>
      )}
      {description && (
        <p className="mb-4 text-sm text-white/50">{description}</p>
      )}
      {children}
    </div>
  );
}

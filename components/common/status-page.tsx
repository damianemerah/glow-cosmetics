import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusPageProps {
  icon?: LucideIcon;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  /** Main content, usually one or more <StatusPanel>s. */
  children?: ReactNode;
  /** Buttons shown under the content; stacked on mobile. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Centred, single-column layout for focused flows: confirmations, payment
 * and account steps. Matches the 404/error pages' heading treatment.
 */
export default function StatusPage({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
  actions,
  className,
}: StatusPageProps) {
  return (
    <section className="bg-background px-4 py-14 md:py-20">
      <div className={cn("mx-auto w-full max-w-xl", className)}>
        <header className="text-center">
          {Icon && (
            <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success ring-8 ring-success/5">
              <Icon className="h-7 w-7" />
            </span>
          )}
          <p className="eyebrow justify-center text-primary">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-medium leading-tight text-foreground md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              {description}
            </p>
          )}
        </header>

        {children && <div className="mt-10 space-y-5">{children}</div>}

        {actions && (
          <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}

/** Card surface used inside StatusPage. */
export function StatusPanel({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-6 text-card-foreground shadow-soft md:p-8",
        className,
      )}
    >
      {title && (
        <h2 className="mb-5 text-xl font-medium text-foreground">{title}</h2>
      )}
      {children}
    </div>
  );
}

/** Label/value row for summaries inside a StatusPanel. */
export function StatusRow({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium text-foreground">{children}</dd>
    </div>
  );
}

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/constants/ui/index";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-secondary/40 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="font-heading text-xl font-medium text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button className="mt-6" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

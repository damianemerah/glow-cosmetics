import { Badge } from "@/constants/ui/index";
import { cn } from "@/lib/utils";

type Tone =
  | "success"
  | "warning"
  | "info"
  | "highlight"
  | "destructive"
  | "muted";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  highlight: "bg-highlight/15 text-highlight-foreground",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

const statusTones: Record<string, Tone> = {
  // bookings
  confirmed: "success",
  pending: "warning",
  completed: "info",
  cancelled: "destructive",
  // orders
  paid: "info",
  processing: "warning",
  shipped: "highlight",
  delivered: "success",
  failed: "destructive",
};

export default function StatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const key = (status ?? "").toLowerCase();
  const tone = statusTones[key] ?? "muted";

  return (
    <Badge
      className={cn(
        "border-transparent capitalize hover:bg-inherit",
        toneClasses[tone],
        className,
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {key || "unknown"}
    </Badge>
  );
}

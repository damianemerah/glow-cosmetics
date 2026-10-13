import { Clock } from "lucide-react";
import type { Booking } from "@/types/index";
import { capitalize, formatZAR } from "@/utils";
import { cn } from "@/lib/utils";
import StatusBadge from "./status-badge";

export default function BookingRow({
  booking,
  isPast = false,
}: {
  booking: Booking;
  isPast?: boolean;
}) {
  const date = new Date(booking.booking_time);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary/40",
        isPast && "opacity-70",
      )}
    >
      <div className="flex w-14 shrink-0 flex-col items-center rounded-lg bg-accent py-2 text-accent-foreground">
        <span className="text-[0.65rem] font-semibold uppercase tracking-widest">
          {date.toLocaleDateString(undefined, { month: "short" })}
        </span>
        <span className="font-heading text-2xl leading-none">
          {date.getDate()}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-foreground">
          {capitalize(booking.service_name)}
        </h4>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>
            {date.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {booking.service_price > 0 && (
            <span>{formatZAR(booking.service_price)}</span>
          )}
        </p>
      </div>

      <StatusBadge status={booking.status} className="shrink-0" />
    </div>
  );
}

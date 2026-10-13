import { Button } from "@/constants/ui/index";
import { CalendarCheck, Mail } from "lucide-react";
import Link from "next/link";
import StatusPage, {
  StatusPanel,
  StatusRow,
} from "@/components/common/status-page";

const nextSteps = [
  "Arrive 10 minutes before your scheduled appointment time",
  "Bring a form of ID for verification",
  "The remaining balance will be due at the time of your appointment",
];

export default function BookingPage({ bookingId }: { bookingId: string }) {
  return (
    <StatusPage
      icon={CalendarCheck}
      eyebrow="Thank you"
      title="Booking confirmed"
      description="Thank you for your deposit payment. Your appointment has been secured with Glow by UgoSylvia."
      actions={
        <>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">View My Bookings</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/">Return to Home</Link>
          </Button>
        </>
      }
    >
      <StatusPanel>
        <dl className="divide-y">
          <StatusRow label="Booking reference">
            <span className="break-words font-mono text-xs tracking-wide">
              {bookingId}
            </span>
          </StatusRow>
        </dl>
        <p className="mt-5 flex items-start gap-3 rounded-xl bg-secondary/70 p-4 text-sm text-muted-foreground">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          A confirmation email has been sent to your registered email address
          with all the details.
        </p>
      </StatusPanel>

      <StatusPanel title="What's next?">
        <ol className="space-y-4">
          {nextSteps.map((step, i) => (
            <li key={step} className="flex items-start gap-4 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-highlight/50 font-heading text-sm text-foreground">
                {i + 1}
              </span>
              <span className="pt-1 text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>
      </StatusPanel>
    </StatusPage>
  );
}

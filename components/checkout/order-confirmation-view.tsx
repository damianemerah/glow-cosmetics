import Link from "next/link";
import { CheckCircle2, ChevronDown, CreditCard, Mail, Package } from "lucide-react";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/constants/ui/index";
import StatusPage, {
  StatusPanel,
  StatusRow,
} from "@/components/common/status-page";
import { cn } from "@/lib/utils";
import { formatZAR } from "@/utils";

export interface ConfirmationShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderConfirmationViewProps {
  order: {
    payment_reference: string;
    status: string | null;
    total_price: number;
    email: string;
    delivery_method: string;
  };
  shippingAddress: ConfirmationShippingAddress | null;
  storeInfo: { address: string; phone: string; hours: string[] };
}

export default function OrderConfirmationView({
  order,
  shippingAddress,
  storeInfo,
}: OrderConfirmationViewProps) {
  const isPaid = order.status === "paid";
  const isPickup = order.delivery_method === "store_pickup";

  return (
    <StatusPage
      icon={CheckCircle2}
      eyebrow="Thank you"
      title="Order confirmed"
      description="Thank you for your purchase."
      actions={
        <>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">View My Orders</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </>
      }
    >
      <StatusPanel>
        <dl className="divide-y">
          <StatusRow label="Order reference">
            <span className="break-words font-mono text-xs tracking-wide">
              {order.payment_reference}
            </span>
          </StatusRow>
          <StatusRow label="Status">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                isPaid
                  ? "bg-success/10 text-success"
                  : "bg-warning/10 text-warning",
              )}
            >
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
              {isPaid ? "Paid" : "Pending Payment"}
            </span>
          </StatusRow>
          <StatusRow label="Total">
            <span className="font-heading text-xl">
              {formatZAR(order.total_price)}
            </span>
          </StatusRow>
        </dl>
        <p className="mt-5 flex items-start gap-3 rounded-xl bg-secondary/70 p-4 text-sm text-muted-foreground">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            We&apos;ve sent a confirmation email to{" "}
            <span className="font-medium text-foreground">{order.email}</span>.
          </span>
        </p>
      </StatusPanel>

      {!isPaid && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-5 text-sm">
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div>
            <p className="font-medium text-warning">Payment Pending</p>
            <p className="mt-1 text-muted-foreground">
              We&apos;re still processing your payment. Please contact support
              if you&apos;ve already paid.
            </p>
          </div>
        </div>
      )}

      {(isPickup || shippingAddress) && (
        <Collapsible className="group rounded-2xl border bg-card shadow-soft">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 p-6 text-left md:px-8">
            <span className="flex items-center gap-3 font-heading text-lg text-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Package className="h-4 w-4" />
              </span>
              {isPickup ? "Pickup Information" : "Shipping Information"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 border-t px-6 py-5 text-sm text-muted-foreground md:px-8">
            {isPickup ? (
              <>
                <p>
                  <span className="font-medium text-foreground">
                    Pickup Location
                  </span>
                  <br />
                  {storeInfo.address}
                </p>
                <p>
                  <span className="font-medium text-foreground">Contact</span>
                  <br />
                  {storeInfo.phone}
                </p>
                <p>
                  <span className="font-medium text-foreground">Hours</span>
                  {storeInfo.hours.map((h) => (
                    <span key={h} className="block">
                      {h}
                    </span>
                  ))}
                </p>
                <p className="text-foreground">
                  Your order will be ready for pickup within 1-2 business days.
                  Please bring your order reference and ID.
                </p>
              </>
            ) : (
              shippingAddress && (
                <>
                  <address className="not-italic leading-relaxed">
                    <span className="block font-medium text-foreground">
                      {shippingAddress.firstName} {shippingAddress.lastName}
                    </span>
                    <span className="block">{shippingAddress.address}</span>
                    {shippingAddress.apartment && (
                      <span className="block">{shippingAddress.apartment}</span>
                    )}
                    <span className="block">
                      {shippingAddress.city}, {shippingAddress.state}{" "}
                      {shippingAddress.zipCode}
                    </span>
                    <span className="block">{shippingAddress.country}</span>
                  </address>
                  <p className="text-foreground">
                    Your order will be shipped within 1-2 business days.
                  </p>
                </>
              )
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </StatusPage>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/constants/ui/index";

interface DepositPopupProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  depositAmount?: number;
}

export function DepositPopup({
  bookingId,
  open,
  onOpenChange,
  depositAmount = 200,
}: DepositPopupProps) {
  const router = useRouter();

  if (!bookingId) {
    return null;
  }

  const handlePayDeposit = () => {
    // Redirect to payment page with booking ID
    router.push(`/payment/deposit?bookingId=${bookingId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-montserrat text-center">
            Confirm Your Booking with a Deposit
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            To secure your booking, please pay a non-refundable deposit of R
            {depositAmount}. This will confirm your appointment with Glow by
            UgoSylvia.
            <br />
            <br />
            <strong>Note:</strong> You have 30 minutes to make the payment to
            confirm your booking.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-xl font-bold text-green-600">
              R{depositAmount}
            </span>
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            className="bg-green-500 hover:bg-green-600 w-full sm:w-auto"
            onClick={handlePayDeposit}
          >
            Pay Deposit Now
          </Button>
        </DialogFooter>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Suspense, use } from "react";
import { notFound } from "next/navigation";
import BookingPage from "./BookingPage";
import { Loader2 } from "lucide-react";

export default function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { bookingId } = use(searchParams);

  if (!bookingId) {
    return notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <BookingPage bookingId={bookingId} />
    </Suspense>
  );
}

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
    <div className="container mx-auto py-6 px-4 md:px-6 flex justify-center items-center">
      <Suspense
        fallback={
          <div className="flex justify-center items-center">
            <Loader2 />
          </div>
        }
      >
        <BookingPage bookingId={bookingId} />
      </Suspense>
    </div>
  );
}

"use client"; // Must be a Client Component to handle interactivity

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string }; // Error object with optional digest
  reset: () => void; // Function to retry rendering the segment
}

export default function GlobalError({ error, reset }: ErrorProps) {
  // Log the error for debugging (e.g., to a logging service)
  useEffect(() => {
    console.error("Global error occurred:", error);
    // Optionally, send the error to a logging service like Sentry
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full p-6 md:p-8 text-center">
        <h1 className="text-3xl font-bold text-[#4CAF50] font-montserrat mb-4">
          Oops, Something Went Wrong!
        </h1>
        <p className="text-base text-[#727272] font-open-sans mb-6">
          We encountered an unexpected error. Don’t worry, let’s try again.
        </p>
        <p className="text-sm text-red-500 font-open-sans mb-4">
          Error: {error.message || "An unknown error occurred"}
        </p>
        <Button
          onClick={reset}
          className="bg-[#4CAF50] hover:bg-green-600 text-white rounded-lg py-3 px-6 text-lg"
        >
          Try Again
        </Button>
        <p className="text-sm text-[#727272] font-open-sans mt-4">
          If the problem persists, please{" "}
          <a href="/contact" className="underline text-[#4CAF50]">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
}

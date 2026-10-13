"use client"; // Must be a Client Component to handle interactivity

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string }; // Error object with optional digest
  reset: () => void; // Function to retry rendering the segment
}

export default function GlobalError({ error, reset }: ErrorProps) {
  // Log the error for debugging (e.g., to a logging service)
  useEffect(() => {
    console.error("Global error occurred:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-20">
      <div className="w-full max-w-lg text-center">
        <p className="eyebrow mb-4 text-primary">Something went wrong</p>
        <h1 className="font-heading text-4xl font-medium leading-tight text-foreground md:text-5xl">
          We hit an unexpected snag
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Don&apos;t worry, nothing you did caused this. Please try again, or
          head back to the home page.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="mx-auto mt-6 max-w-md rounded-lg bg-destructive/5 p-3 font-mono text-xs text-destructive">
            {error.message || "An unknown error occurred"}
          </p>
        )}
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          If the problem persists, please{" "}
          <Link href="/contact" className="text-primary hover:underline">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

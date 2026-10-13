"use client";

import { Button } from "@/constants/ui/index";

interface ErrorViewProps {
  error: string | null;
  onRetry: () => void;
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <span className="text-destructive text-xl">!</span>
      </div>
      <p className="mb-4 text-destructive">
        {error || "An unknown error occurred"}
      </p>
      <Button
        type="button"
        onClick={onRetry}
        className="mt-2 bg-primary hover:bg-primary/90"
      >
        Try Again
      </Button>
    </div>
  );
}

"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/constants/ui/index";

interface ErrorViewProps {
  error: string | null;
  onRetry: () => void;
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <p className="mb-4 text-sm text-destructive">
        {error || "An unknown error occurred"}
      </p>
      <Button
        type="button"
        onClick={onRetry}
        size="lg"
        className="mt-2"
      >
        Try Again
      </Button>
    </div>
  );
}

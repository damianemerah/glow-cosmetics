"use client";

import { Button } from "@/constants/ui/index";

interface ErrorViewProps {
  error: string | null;
  onRetry: () => void;
}

export function ErrorView({ error, onRetry }: ErrorViewProps) {
  return (
    <div className="py-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <span className="text-red-600 text-xl">!</span>
      </div>
      <p className="mb-4 text-red-500">
        {error || "An unknown error occurred"}
      </p>
      <Button
        type="button"
        onClick={onRetry}
        className="mt-2 bg-green-500 hover:bg-green-600"
      >
        Try Again
      </Button>
    </div>
  );
}

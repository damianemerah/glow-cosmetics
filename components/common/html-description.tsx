"use client";

import { useState } from "react";

function HtmlDescription({
  description,
  limit = 200,
}: {
  description: string;
  limit?: number;
}) {
  const [showFull, setShowFull] = useState(false);

  const plainText = description.replace(/<[^>]+>/g, ""); // strip HTML
  const isLong = plainText.length > limit;
  const truncatedText = plainText.slice(0, limit) + (isLong ? "..." : "");

  return (
    <div className="prose max-w-none text-foreground p-4 md:p-6 bg-muted/30 rounded-lg border">
      {!showFull ? (
        <>
          <p>{truncatedText}</p>
          {isLong && (
            <button
              onClick={() => setShowFull(true)}
              className="text-sm text-primary mt-2 underline"
            >
              Show more...
            </button>
          )}
        </>
      ) : (
        <>
          <div dangerouslySetInnerHTML={{ __html: description }} />
          <button
            onClick={() => setShowFull(false)}
            className="text-sm text-primary mt-2 underline"
          >
            Show less
          </button>
        </>
      )}
    </div>
  );
}

export default HtmlDescription;

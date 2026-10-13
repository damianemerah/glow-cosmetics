"use client";

import { useState } from "react";

const ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

// Plain-text preview of stored rich text: tags become spaces (so block
// elements don't run words together) and common HTML entities are decoded.
function toPlainText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] !== "#") return ENTITIES[code.toLowerCase()] ?? match;
      const n =
        code[1].toLowerCase() === "x"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function HtmlDescription({
  description,
  limit = 200,
}: {
  description: string;
  limit?: number;
}) {
  const [showFull, setShowFull] = useState(false);

  const plainText = toPlainText(description);
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

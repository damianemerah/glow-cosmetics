// @/components/common/pagination.tsx
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/constants/ui/index";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  // Keep the flexible prop type, but handle it internally
  searchParams?:
    | URLSearchParams
    | Record<string, string | string[] | undefined>;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  // Helper to create page URLs while preserving other search params
  const createPageUrl = (pageNumber: number): string => {
    // --- FIX STARTS HERE ---
    // Create a new, mutable URLSearchParams instance based on input type
    let params: URLSearchParams;

    if (searchParams instanceof URLSearchParams) {
      // If it's already URLSearchParams, create a copy
      params = new URLSearchParams(searchParams);
    } else if (typeof searchParams === "object" && searchParams !== null) {
      // If it's a Record-like object, manually build the params
      params = new URLSearchParams();
      for (const [key, value] of Object.entries(searchParams)) {
        // Skip keys with undefined values
        if (value !== undefined) {
          if (Array.isArray(value)) {
            // If value is an array, append each item
            // Important: Clear existing values for this key first if overwriting is desired,
            // otherwise just append. Append is usually correct for preserving URL state.
            // params.delete(key); // Optional: Uncomment if you need to replace arrays entirely
            value.forEach((v) => params.append(key, String(v))); // Ensure value is string
          } else {
            // If value is a single item, set it (overwrites existing)
            params.set(key, String(value)); // Ensure value is string
          }
        }
      }
    } else {
      // Otherwise (e.g., undefined searchParams), start with empty params
      params = new URLSearchParams();
    }
    // --- FIX ENDS HERE ---

    // Now, set the page number on the correctly initialized 'params' object
    params.set("page", pageNumber.toString());

    // Remove page param if it's the first page and you want cleaner URLs (optional)
    // if (pageNumber === 1) {
    //   params.delete('page');
    // }

    const queryString = params.toString();

    // Avoid trailing '?' if queryString is empty
    return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
  };

  // Basic logic to generate page numbers (can be enhanced later)
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisiblePages = 5; // Example: Show max 5 pages directly
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages + 2) {
      // Show all if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Add first page
      pages.push(1);

      // Ellipsis or pages before current
      if (currentPage > halfVisible + 2) {
        pages.push("...");
      }

      const startPage = Math.max(2, currentPage - halfVisible);
      const endPage = Math.min(totalPages - 1, currentPage + halfVisible);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Ellipsis or pages after current
      if (currentPage < totalPages - halfVisible - 1) {
        pages.push("...");
      }

      // Add last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <ShadcnPagination className={cn("mt-6 mb-4", className)}>
      {" "}
      {/* Added margin */}
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            href={createPageUrl(currentPage - 1)}
            className={cn(
              currentPage <= 1 ? "pointer-events-none opacity-50" : ""
            )}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
          />
        </PaginationItem>

        {/* Page Number Links */}
        {pageNumbers.map((page, index) => (
          <PaginationItem key={index}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={createPageUrl(page as number)}
                isActive={page === currentPage}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            href={createPageUrl(currentPage + 1)}
            className={cn(
              currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
            )}
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
}

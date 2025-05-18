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

  const createPageUrl = (pageNumber: number): string => {
    let params: URLSearchParams;

    if (searchParams instanceof URLSearchParams) {
      params = new URLSearchParams(searchParams);
    } else if (typeof searchParams === "object" && searchParams !== null) {
      params = new URLSearchParams();
      for (const [key, value] of Object.entries(searchParams)) {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)));
          } else {
            params.set(key, String(value));
          }
        }
      }
    } else {
      params = new URLSearchParams();
    }

    params.set("page", pageNumber.toString());

    if (pageNumber === 1) {
      params.delete("page");
    }

    const queryString = params.toString();

    return `${baseUrl}${queryString ? `?${queryString}` : ""}`;
  };

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > halfVisible + 2) {
        pages.push("...");
      }

      const startPage = Math.max(2, currentPage - halfVisible);
      const endPage = Math.min(totalPages - 1, currentPage + halfVisible);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - halfVisible - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <ShadcnPagination className={cn("mt-6 mb-4", className)}>
      <PaginationContent>
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

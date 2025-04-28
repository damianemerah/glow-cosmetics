"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import { X } from "lucide-react";
import useSWR from "swr";
import { toast } from "sonner";
import { getClients } from "@/actions/clientActions";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  Input,
  Button,
  Skeleton,
} from "@/constants/ui/index";
import { useSearchParams } from "next/navigation";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalSpent: string;
}

export default function ClientsPage() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || "1");
  const itemsPerPage = 10;

  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  // Fetch initial clients data with swr and getClient() function
  useSWR(
    `/api/clients?page=${currentPage}`,
    () => getClients(currentPage, itemsPerPage),
    {
      onSuccess: (data) => {
        setClients(data?.clients || []);
        setTotalPages(data?.totalPages || 1);
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
        setIsLoading(false);
      },
    }
  );

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search clients using SWR
  const { isValidating } = useSWR(
    debouncedQuery.length > 2
      ? `/api/clients/search?q=${encodeURIComponent(debouncedQuery)}`
      : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Search failed");
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      onSuccess: (data) => {
        if (data.clients) {
          setClients(data.clients);
          // When searching, don't use pagination
          setTotalPages(1);
        }
      },
      onError: (error) => {
        console.error("Search error:", error);
        toast.error("Error searching for clients");
      },
    }
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    // Reset to initial clients
    fetchInitialClients();
  };

  const fetchInitialClients = async () => {
    setIsLoading(true);
    try {
      const data = await getClients(currentPage, itemsPerPage);
      setClients(data?.clients || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching initial clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clientColumns = [
    { key: "name", title: "Name" },
    { key: "phone", title: "Phone" },
    { key: "email", title: "Email" },
    { key: "lastVisit", title: "Last Visit" },
    { key: "totalSpent", title: "Total Spent" },
  ];

  return (
    <div>
      <PageHeader title="Clients" description="Manage your client database" />

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex items-center w-full max-w-md">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 h-full"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLoading || isValidating ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <span className="text-sm text-muted-foreground">
              {clients.length} clients found
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <>
          <DataTable
            columns={clientColumns}
            data={clients}
            emptyState={
              <div className="text-center py-8">
                <p className="text-muted-foreground">No clients found</p>
              </div>
            }
          />

          {totalPages > 1 && !searchQuery && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`/admin/clients?page=${Math.max(1, currentPage - 1)}`}
                    className={
                      currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href={`/admin/clients?page=${pageNum}`}
                        isActive={pageNum === currentPage}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href={`/admin/clients?page=${Math.min(totalPages, currentPage + 1)}`}
                    className={
                      currentPage >= totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}

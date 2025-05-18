// components/admin/ClientList.tsx
"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/data-table";
import Pagination from "@/components/common/pagination";
import { Input, Button, Skeleton } from "@/constants/ui/index";
import { X } from "lucide-react";
import useSWR from "swr";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation"; // Keep for pagination URL updates

// Define the Client interface again or import from types
interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalSpent: string;
}

interface ClientListProps {
  initialClients: Client[];
  initialTotalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

// Client-side fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorInfo = await response.json();
    console.error("Search fetch failed:", errorInfo);
    throw new Error(`Search failed: ${errorInfo.error || "Unknown error"}`);
  }
  return response.json();
};

export default function ClientList({
  initialClients,
  initialTotalPages,
  currentPage, // Receive currentPage from server props
  //   itemsPerPage, // Potentially useful, passed from server
}: ClientListProps) {
  const searchParams = useSearchParams(); // Still needed for Pagination component

  // Initialize state with server-provided data
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [totalPages, setTotalPages] = useState<number>(initialTotalPages);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  // Loading state: false initially because server provided data. True during client-side search.
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce time

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Effect to reset clients if initial props change (e.g., navigating pagination links)
  // This ensures the list updates when the server component rerenders with new props
  useEffect(() => {
    setClients(initialClients);
    setTotalPages(initialTotalPages);
    // Optionally clear search when navigating pages
    // setSearchQuery("");
    // setDebouncedQuery("");
  }, [initialClients, initialTotalPages]);

  // Search clients using SWR (triggered by debouncedQuery)
  useSWR(
    // Only trigger search if query is long enough
    debouncedQuery.length > 2
      ? `/api/clients/search?q=${encodeURIComponent(debouncedQuery)}`
      : null, // SWR key - null means don't fetch
    fetcher, // Use the defined fetcher
    {
      revalidateOnFocus: false, // Optional: disable revalidation on focus
      dedupingInterval: 3000, // Optional: time before refetching same query
      onSuccess: (data) => {
        setClients(data.clients || []);
        // Assuming search results don't have pagination in this API endpoint
        setTotalPages(data.clients?.length > 0 ? 1 : 0);
        setIsSearching(false);
      },
      onError: (error) => {
        console.error("Search error:", error);
        toast.warning(`Error searching clients: ${error.message}`);
        setIsSearching(false);
        // Optional: revert to initial state or show empty on error
        // setClients(initialClients);
        // setTotalPages(initialTotalPages);
      },
      onLoadingChanged: (loading: boolean) => {
        // SWR provides loading state
        setIsSearching(loading);
      },
    }
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Reset to page 1 conceptually when searching, although URL doesn't change here
    // If search API supports pagination, need to handle that
  };

  // Clear search and revert to the initial data passed from the server for the current page
  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery(""); // Prevent lingering search fetch
    setClients(initialClients); // Revert to server-provided data for the current page
    setTotalPages(initialTotalPages);
    setIsSearching(false);
  };

  // Define columns for the DataTable
  const clientColumns = [
    { key: "name", title: "Name" },
    { key: "phone", title: "Phone" },
    { key: "email", title: "Email" },
    { key: "lastVisit", title: "Last Visit" },
    { key: "totalSpent", title: "Total Spent" },
  ];

  // Determine loading state - show skeleton if client-side search is happening
  const isLoading = isSearching;

  return (
    <div>
      {/* Search Input and Client Count */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex items-center w-full max-w-md">
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pr-10" // Make space for the clear button
          />
          {searchQuery && (
            <Button
              variant="ghost" // Use ghost variant for subtle button
              size="sm" // Small size
              className="absolute right-0 top-0 bottom-0 px-3 text-muted-foreground hover:text-foreground" // Position absolutely inside the input padding
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Client count */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-4 w-24" />
          ) : (
            <span className="text-sm text-muted-foreground">
              {/* Show count based on search results or initial load */}
              {clients.length} {clients.length === 1 ? "client" : "clients"}{" "}
              found
            </span>
          )}
        </div>
      </div>

      {/* Table or Skeletons */}
      {isLoading && debouncedQuery.length > 2 ? ( // Show skeletons only during active search
        <div className="space-y-2">
          {" "}
          {/* Reduced spacing */}
          <Skeleton className="h-10 w-full" /> {/* Reduced height */}
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <DataTable
            columns={clientColumns}
            data={clients} // Display current state (initial or search results)
            emptyState={
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {
                    searchQuery
                      ? "No clients match your search."
                      : "No clients found." // Different message if searching
                  }
                </p>
                {searchQuery && ( // Offer to clear search if empty results
                  <Button variant="link" onClick={clearSearch}>
                    Clear search
                  </Button>
                )}
              </div>
            }
          />
          {/* Render pagination only if not searching or if search API supports it */}
          {!debouncedQuery && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/admin/clients" // Base path for links
              searchParams={searchParams} // Pass current searchParams for link generation
            />
          )}
        </>
      )}
    </div>
  );
}

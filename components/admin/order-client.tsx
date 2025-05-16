"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/constants/ui/index";
import DataTable from "@/components/admin/data-table";
import { OrderDetail } from "@/components/admin/order-detail";
import { Plus, Search, X, Loader2 } from "lucide-react";
import { formatZAR } from "@/utils";
import { getOrderByRef, fetchOrders } from "@/actions/orderAction";
import { toast } from "sonner";
import { Order } from "@/types/index";
import Pagination from "@/components/common/pagination";
import useSWR from "swr";

// Define the expected return type from fetchOrders
interface FetchOrdersResult {
  orders: Order[];
  totalPages: number;
  totalCount?: number;
}

interface OrderClientProps {
  initialOrders: Order[];
  totalPages: number;
  currentPage: number;
  currentStatus: string;
  currentUserSearch: string;
}

export default function OrderClient({
  initialOrders,
  totalPages,
  currentPage,
  currentStatus,
  currentUserSearch,
}: OrderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [statusFilter, setStatusFilter] = useState(currentStatus);
  const [userSearchInput, setUserSearchInput] = useState(currentUserSearch);
  const [searchRef, setSearchRef] = useState("");
  const [searchResults, setSearchResults] = useState<Order[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefSearching, setIsRefSearching] = useState(false);

  // SWR key ignores reference search
  const cacheKey = searchRef
    ? null
    : `admin-orders${statusFilter !== "all" ? `-${statusFilter}` : ""}-page-${currentPage}${userSearchInput ? `-search-${userSearchInput}` : ""}`;

  const { data, isValidating } = useSWR<FetchOrdersResult>(
    cacheKey,
    async () => {
      const result = await fetchOrders(
        currentPage,
        statusFilter,
        userSearchInput
      );
      return result as FetchOrdersResult;
    },
    {
      fallbackData: { orders: initialOrders, totalPages } as FetchOrdersResult,
      revalidateOnFocus: true,
    }
  );

  const displayedOrders = searchResults ?? data?.orders ?? initialOrders;
  const isLoading = isPending || isValidating;

  // Reset search results when filters change
  useEffect(() => {
    setStatusFilter(currentStatus);
    setUserSearchInput(currentUserSearch);
    if (!searchRef) {
      setSearchResults(null);
    }
  }, [currentStatus, currentUserSearch, searchRef]);

  // --- Handlers ---
  const updateUrl = (params: URLSearchParams) => {
    params.set("page", "1");
    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`, { scroll: false });
    });
  };

  const handleFilterChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === "all") newParams.delete("status");
    else newParams.set("status", value);

    setStatusFilter(value);
    setSearchResults(null);
    setSearchRef("");

    updateUrl(newParams);
  };

  const handleUserSearch = () => {
    const term = userSearchInput.trim();
    const newParams = new URLSearchParams(searchParams.toString());
    if (term) newParams.set("userSearch", term);
    else newParams.delete("userSearch");

    setSearchResults(null);
    setSearchRef("");
    updateUrl(newParams);
  };

  const resetUserSearch = () => {
    setUserSearchInput("");
    setSearchResults(null);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete("userSearch");
    updateUrl(newParams);
  };

  const handleRefSearch = async () => {
    const term = searchRef.trim();
    if (!term) {
      toast.warning("Please enter a payment reference");
      return;
    }
    setIsRefSearching(true);
    try {
      const order = await getOrderByRef(term);
      setSearchResults(order ? [order] : []);
      toast[order ? "success" : "warning"](
        order ? "Order found." : "No order found with that reference"
      );
    } catch {
      toast.warning("Failed to find order");
    } finally {
      setIsRefSearching(false);
    }
  };

  const resetRefSearch = () => {
    setSearchRef("");
    setSearchResults(null);
    const currentParams = new URLSearchParams(searchParams.toString());
    if (!currentParams.has("page")) {
      currentParams.set("page", "1");
    }
    startTransition(() => {
      router.push(`/admin/orders?${currentParams.toString()}`, {
        scroll: false,
      });
    });
  };

  // --- Columns ---
  const orderColumns = [
    {
      key: "id",
      title: "Order Ref / Date",
      render: (row: Order) => (
        <div>
          <div className="font-medium">{row.payment_reference}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(row.created_at).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: "client",
      title: "Client",
      render: (row: Order) => (
        <div>
          <div>
            {`${row.first_name || ""} ${row.last_name || ""}`.trim() || "N/A"}
          </div>
          <div className="text-sm text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      key: "payment",
      title: "Payment",
      render: (row: Order) => (
        <div>
          <div>{formatZAR(row.total_price)}</div>
          <div className="text-sm text-muted-foreground capitalize">
            {row.payment_method?.replace(/_/g, " ") || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (row: Order) => {
        const statusStyles: Record<string, string> = {
          shipped: "bg-purple-100 text-purple-800",
          cancelled: "bg-red-100 text-red-800",
          paid: "bg-emerald-100 text-emerald-800",
          pending: "bg-yellow-100 text-yellow-800",
        };
        const style =
          statusStyles[row.status || "all"] || "bg-gray-100 text-gray-800";
        return (
          <Badge className={`${style} capitalize`}>
            {row.status?.replace(/_/g, " ") || "Unknown"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (row: Order) => (
        <OrderDetail orderId={row.id} initialStatus={row.status || "all"} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          {/* User Search (Name/Email) */}
          <div className="relative w-full sm:w-auto">
            <Input
              placeholder="Search by Name/Email..."
              className="w-full md:max-w-xs pr-16"
              value={userSearchInput}
              onChange={(e) => setUserSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUserSearch()}
              disabled={isPending || isRefSearching}
            />
            {userSearchInput && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-9 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={resetUserSearch}
                disabled={isPending || isRefSearching}
                aria-label="Clear user search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={handleUserSearch}
              disabled={isPending || isRefSearching}
              aria-label="Search users"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={handleFilterChange}
            disabled={isPending || !!searchRef}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Order Ref Search (unchanged) */}
          <div className="relative w-full sm:w-auto">
            <Input
              placeholder="Search by Order Ref..."
              className="w-full md:max-w-xs pr-16"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value.toLowerCase())}
              onKeyDown={(e) => e.key === "Enter" && handleRefSearch()}
              disabled={isRefSearching || isPending}
            />
            {searchRef && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-9 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={resetRefSearch}
                disabled={isRefSearching || isPending}
                aria-label="Clear reference search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={handleRefSearch}
              disabled={isRefSearching || !searchRef.trim() || isPending}
              aria-label="Search by reference"
            >
              {isRefSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Link href="/admin/orders/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </Link>
        </div>
      </div>

      <DataTable
        columns={orderColumns}
        data={displayedOrders}
        loadingState={
          isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : null
        }
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchRef
                ? "No order found for that reference."
                : "No orders match the current filters."}
            </p>
            {!searchRef && (currentStatus !== "all" || currentUserSearch) && (
              <Button
                variant="link"
                onClick={() => {
                  setStatusFilter("all");
                  resetUserSearch();
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        }
      />

      {!searchRef && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/admin/orders"
          searchParams={searchParams}
        />
      )}
    </div>
  );
}

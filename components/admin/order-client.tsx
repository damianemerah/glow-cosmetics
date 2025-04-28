"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Input,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
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
import { getOrderByRef } from "@/actions/orderAction";
import { toast } from "sonner";

interface Order {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  total_price: number;
  status: string;
  payment_method: string;
  payment_reference: string;
  email: string;
}

interface OrderClientProps {
  initialOrders: Order[];
  totalPages: number;
  currentPage: number;
}

export default function OrderClient({
  initialOrders,
  totalPages,
  currentPage,
}: OrderClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchRef, setSearchRef] = useState("");
  const [isRefSearching, setIsRefSearching] = useState(false);

  // Filter orders based on status
  useEffect(() => {
    if (statusFilter === "all") {
      setOrders(initialOrders);
      return;
    }

    const filtered = initialOrders.filter(
      (order) => order.status === statusFilter
    );
    setOrders(filtered);
  }, [statusFilter, initialOrders]);

  // Search for order by payment reference
  const handleRefSearch = async () => {
    if (!searchRef.trim()) {
      toast.error("Please enter a payment reference");
      return;
    }

    setIsRefSearching(true);
    try {
      const order = await getOrderByRef(searchRef.trim());
      if (order) {
        setOrders([order]);
      } else {
        setOrders([]);
        toast.error("No order found with that reference");
      }
    } catch (error) {
      console.error("Error searching for order:", error);
      toast.error("Failed to find order");
    } finally {
      setIsRefSearching(false);
    }
  };

  const resetSearch = () => {
    setSearchRef("");
    setOrders(initialOrders);
  };

  const orderColumns = [
    {
      key: "id",
      title: "Order ID",
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
          <div>{`${row.first_name} ${row.last_name}`}</div>
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
            {row.payment_method?.replace("_", " ") || "Not specified"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (row: Order) => {
        const statusStyles: Record<string, string> = {
          delivered: "bg-green-100 text-green-800",
          processing: "bg-blue-100 text-blue-800",
          shipped: "bg-purple-100 text-purple-800",
          cancelled: "bg-red-100 text-red-800",
          paid: "bg-emerald-100 text-emerald-800",
          pending: "bg-yellow-100 text-yellow-800",
          pending_payment: "bg-cyan-100 text-cyan-800",
        };

        const style = statusStyles[row.status] || "bg-gray-100 text-gray-800";

        return (
          <Badge className={style}>
            {row.status?.replace("_", " ") || "Unknown"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (row: Order) => (
        <OrderDetail orderId={row.id} initialStatus={row.status} />
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <div className="relative">
            <Input
              placeholder="Search by order ID..."
              className="max-w-xs"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRefSearch()}
            />
            {searchRef && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-8 top-1/2 transform -translate-y-1/2"
                onClick={resetSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-0 top-1/2 transform -translate-y-1/2"
              onClick={handleRefSearch}
              disabled={isRefSearching}
            >
              {isRefSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Select
            defaultValue="all"
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button variant="outline">Print</Button>
          <Link href="/admin/orders/create">
            <Button className="bg-primary text-white hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </Link>
        </div>
      </div>

      <DataTable
        columns={orderColumns}
        data={orders}
        loadingState={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        }
      />

      {totalPages > 1 && !searchRef && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/admin/orders?page=${Math.max(1, currentPage - 1)}`}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`/admin/orders?page=${pageNum}`}
                    isActive={pageNum === currentPage}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href={`/admin/orders?page=${Math.min(totalPages, currentPage + 1)}`}
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
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/admin/page-header";
import DataTable from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";
import { formatZAR } from "@/utils/formattedCurrency";
import { OrderDetail } from "@/components/admin/order-detail";
import { Plus } from "lucide-react";

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

export default async function OrdersPage() {
  const supabase = await createClient();

  // Get orders from database, sorted by creation date (newest first)
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading orders:", error);
    return <div>Error loading orders. Please try again later.</div>;
  }

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
          awaiting_payment: "bg-orange-100 text-orange-800",
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
      <PageHeader
        title="Orders"
        description="Manage customer orders and payment status"
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Input placeholder="Search orders..." className="max-w-xs" />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
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

      <DataTable columns={orderColumns} data={orders || []} />
    </div>
  );
}

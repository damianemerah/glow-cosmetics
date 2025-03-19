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

// Mock data for orders
const orders = [
  {
    id: "ORD-001",
    date: "Mar 10, 2025",
    client: "Sarah Johnson",
    items: "Vitamin C Serum, Collagen Supplements",
    total: "R89.98",
    status: "Delivered",
  },
  {
    id: "ORD-002",
    date: "Mar 9, 2025",
    client: "Emily Davis",
    items: "Hydrating Lip Gloss",
    total: "R24.99",
    status: "Processing",
  },
  {
    id: "ORD-003",
    date: "Mar 8, 2025",
    client: "Jessica Wilson",
    items: "Gentle Cleanser, Retinol Night Cream",
    total: "R84.98",
    status: "Shipped",
  },
  {
    id: "ORD-004",
    date: "Mar 7, 2025",
    client: "Michael Brown",
    items: "Collagen Supplements",
    total: "R39.99",
    status: "Cancelled",
  },
  {
    id: "ORD-005",
    date: "Mar 6, 2025",
    client: "David Miller",
    items: "Vitamin C Serum",
    total: "R49.99",
    status: "Delivered",
  },
];

const orderColumns = [
  {
    key: "id",
    title: "Order ID",
    render: (row: any) => (
      <div>
        <div className="font-medium">{row.id}</div>
        <div className="text-sm text-muted-foreground">{row.date}</div>
      </div>
    ),
  },
  { key: "client", title: "Client" },
  { key: "items", title: "Items" },
  { key: "total", title: "Total" },
  {
    key: "status",
    title: "Status",
    render: (row: any) => {
      const statusStyles = {
        Delivered: "bg-green-100 text-green-800",
        Processing: "bg-blue-100 text-blue-800",
        Shipped: "bg-purple-100 text-purple-800",
        Cancelled: "bg-red-100 text-red-800",
      };

      // @ts-ignore - We know the status will be one of the keys
      const style = statusStyles[row.status] || "bg-gray-100 text-gray-800";

      return <Badge className={style}>{row.status}</Badge>;
    },
  },
  {
    key: "actions",
    title: "Actions",
    render: (row: any) => {
      if (row.status === "Processing") {
        return (
          <Button
            size="sm"
            className="bg-primary text-white hover:bg-primary/90"
          >
            Mark as Shipped
          </Button>
        );
      }

      if (row.status === "Shipped") {
        return (
          <Button
            size="sm"
            className="bg-primary text-white hover:bg-primary/90"
          >
            Mark as Delivered
          </Button>
        );
      }

      return (
        <Button size="sm" variant="outline">
          View Details
        </Button>
      );
    },
  },
];

export default function OrdersPage() {
  return (
    <div>
      <PageHeader
        title="Orders"
        description="Manage product orders and shipments"
      />

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Input placeholder="Search orders..." className="max-w-xs" />
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
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
        </div>
      </div>

      <DataTable columns={orderColumns} data={orders} />
    </div>
  );
}

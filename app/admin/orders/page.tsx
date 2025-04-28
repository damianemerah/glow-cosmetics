import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/utils/supabase/server";
import OrderClient from "@/components/admin/order-client";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = await createClient();
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const itemsPerPage = 10;

  // Count total orders for pagination
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  // Get orders from database with pagination
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

  if (error) {
    console.error("Error loading orders:", error);
    return <div>Error loading orders. Please try again later.</div>;
  }

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Manage customer orders and payment status"
      />

      <OrderClient
        initialOrders={orders || []}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
}

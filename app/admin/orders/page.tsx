import PageHeader from "@/components/admin/page-header";
import { fetchOrders } from "@/actions/orderAction";
import OrderClient from "@/components/admin/order-client";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // const page = searchParams?.page || "1";
  // const status = searchParams?.status || "all";
  // const userSearch = searchParams?.userSearch || "";

  const { page = "1", status = "all", userSearch = "" } = await searchParams;

  const currentPage = parseInt(page, 10);
  const validatedPage =
    !isNaN(currentPage) && currentPage > 0 ? currentPage : 1;

  const { orders, totalPages } = await fetchOrders(
    validatedPage,
    status,
    userSearch
  );

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <PageHeader
        title="Orders"
        description="Manage customer orders and payment status"
      />
      <OrderClient
        initialOrders={orders}
        totalPages={totalPages}
        currentPage={validatedPage}
        currentStatus={status}
        currentUserSearch={userSearch}
      />
    </div>
  );
}

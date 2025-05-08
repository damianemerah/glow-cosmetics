import PageHeader from "@/components/admin/page-header";
import StatCard from "@/components/admin/stat-card";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // Correct import path
import AnalyticsCharts from "@/components/admin/analytics-charts";
import AnalyticsFilters from "@/components/admin/analytics-filters"; // Import the filter component
import {
  startOfYear,
  endOfYear,
  parseISO,
  isValid,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
} from "date-fns";

type OrderItemWithCategories = {
  quantity: number | null;
  products: Array<{
    product_categories: Array<{
      categories: Array<{
        name: string | null;
      }>;
    }>;
  }> | null;
};

// Chart configurations
const revenueChartConfig = {
  services: {
    label: "Services",
    color: "hsl(142, 71%, 45%)", // Green
  },
  products: {
    label: "Products",
    color: "hsl(47, 100%, 50%)", // Yellow
  },
};

const appointmentChartConfig = {
  count: {
    label: "Appointments",
    color: "hsl(142, 71%, 45%)",
  },
};

const productChartConfig = {
  value: {
    label: "Sales",
    color: "hsl(142, 71%, 45%)",
  },
};

const distributionChartConfig = {
  // Config might still be useful for tooltips or other chart elements
  services: { label: "Services" }, // Example if needed
  products: { label: "Products" }, // Example if needed
};

// --- Data Fetching Functions (Modified to accept dates) ---

async function getRevenueData(startDate: string, endDate: string) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Fetch Bookings
  const { data: bookingsData, error: bookingsError } = await supabaseAdmin
    .from("bookings")
    .select("booking_time, service_price")
    .gte("booking_time", startDate)
    .lte("booking_time", endDate);

  if (bookingsError) {
    console.error("Error fetching bookings data for revenue:", bookingsError);
    // Decide how to handle error, maybe return empty structure or throw
  }

  // Fetch Orders
  const { data: ordersData, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("created_at, total_price")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (ordersError) {
    console.error("Error fetching orders data for revenue:", ordersError);
  }

  // Initialize revenue data
  // A more dynamic approach based on the actual date range might be better for long ranges
  const revenueData = months.map((month) => ({
    month,
    services: 0,
    products: 0,
  }));

  // Process bookings data
  bookingsData?.forEach((booking) => {
    if (!booking.booking_time) return;
    try {
      const bookingDate = new Date(booking.booking_time);
      const monthIndex = bookingDate.getMonth(); // 0-indexed
      if (monthIndex >= 0 && monthIndex < 12) {
        revenueData[monthIndex].services += booking.service_price || 0;
      }
    } catch (e) {
      console.error("Error parsing booking date:", booking.booking_time, e);
    }
  });

  // Process orders data
  ordersData?.forEach((order) => {
    if (!order.created_at) return;
    try {
      const orderDate = new Date(order.created_at);
      const monthIndex = orderDate.getMonth(); // 0-indexed
      if (monthIndex >= 0 && monthIndex < 12) {
        revenueData[monthIndex].products += order.total_price || 0;
      }
    } catch (e) {
      console.error("Error parsing order date:", order.created_at, e);
    }
  });

  return revenueData;
}

async function getAppointmentData(startDate: string, endDate: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("service_name, id") // Fetching id just to count rows
    .gte("booking_time", startDate)
    .lte("booking_time", endDate);

  if (error) {
    console.error("Error fetching appointment data:", error);
    return []; // Return empty on error
  }

  // Count services
  const serviceCounts: Record<string, number> = {};
  data?.forEach((booking) => {
    const serviceName = booking.service_name || "Unknown Service"; // Handle null names
    serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
  });

  // Convert to array format needed for chart, sort, and take top 5
  return Object.keys(serviceCounts)
    .map((name) => ({ name, count: serviceCounts[name] }))
    .sort((a, b) => b.count - a.count) // Sort descending by count
    .slice(0, 5); // Get top 5 services
}

async function getProductData(startDate: string, endDate: string) {
  // Join order_items with products and categories
  const { data: orderItems, error } = await supabaseAdmin
    .from("order_items")
    .select(
      `
            quantity,
            products!inner (
                product_categories!inner (
                    categories!inner ( name )
                )
            )
        `
    )
    .eq("status", "complete")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) {
    console.error("Error fetching product data:", error);
    return [];
  }

  const categoryCounts: Record<string, number> = {};
  let totalSales = 0;

  orderItems?.forEach((item: OrderItemWithCategories) => {
    const categoryName =
      // @ts-expect-error: we know item.products isn’t really an array here
      item.products?.product_categories?.[0]?.categories?.name || "Other";
    const quantity = item.quantity || 0; // Default quantity to 0 if null
    if (quantity > 0) {
      categoryCounts[categoryName] =
        (categoryCounts[categoryName] || 0) + quantity;
      totalSales += quantity;
    }
  });

  // orderItems?.forEach((item: OrderItemWithCategories) => {
  //   const firstProduct = item.products?.[0];
  //   const firstProdCategory = firstProduct?.product_categories?.[0];
  //   const category = firstProdCategory?.categories?.[0]; // because categories is also an array
  //   const categoryName = category?.name ?? "Other";
  //   const quantity = item.quantity ?? 0;

  //   if (quantity > 0) {
  //     categoryCounts[categoryName] =
  //       (categoryCounts[categoryName] || 0) + quantity;
  //     totalSales += quantity;
  //   }
  // });

  if (totalSales === 0) return []; // Avoid division by zero

  // Convert to percentage and array format for chart
  return Object.keys(categoryCounts)
    .map((category) => ({
      name: category,
      value: Math.round((categoryCounts[category] / totalSales) * 100),
    }))
    .sort((a, b) => b.value - a.value); // Sort descending by percentage
}

async function getRevenueDistribution(startDate: string, endDate: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("service_name, service_price")
    .gte("booking_time", startDate)
    .lte("booking_time", endDate);

  if (error) {
    console.error("Error fetching revenue distribution data:", error);
    return [];
  }

  // Calculate total revenue and distribution by service
  const serviceRevenue: Record<string, number> = {};
  let totalRevenue = 0;

  data?.forEach((booking) => {
    const serviceName = booking.service_name || "Other";
    const price = booking.service_price || 0;
    if (price > 0) {
      // Only include services with actual revenue
      serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + price;
      totalRevenue += price;
    }
  });

  if (totalRevenue === 0) return []; // Avoid division by zero

  // Define colors for the pie chart
  const colors = [
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFC107",
    "#FF9800",
    "#F44336",
    "#9C27B0",
  ]; // Added more colors

  // Convert to percentage and format for chart
  const result = Object.keys(serviceRevenue)
    .map((name, index) => ({
      name,
      // Calculate percentage based on *actual* revenue, not pre-calculated percentage value
      value: Math.round((serviceRevenue[name] / totalRevenue) * 100),
      fill: colors[index % colors.length], // Cycle through colors
    }))
    .sort((a, b) => b.value - a.value); // Sort descending

  // Group smaller services into "Other Services" if needed (Top 4 + Other)
  const maxSlices = 5; // Show top 4 individually, group the rest
  if (result.length > maxSlices) {
    const topServices = result.slice(0, maxSlices - 1);
    // const otherServices = result.slice(maxSlices - 1);
    // const otherValue = otherServices.reduce((sum, item) => sum + item.value, 0);
    // Ensure percentages don't exceed 100 due to rounding
    const currentTopSum = topServices.reduce(
      (sum, item) => sum + item.value,
      0
    );
    const adjustedOtherValue = Math.max(0, 100 - currentTopSum); // Cap 'Other' percentage

    if (adjustedOtherValue > 0) {
      topServices.push({
        name: "Other Services",
        value: adjustedOtherValue,
        fill: colors[(maxSlices - 1) % colors.length], // Use the next color
      });
    }
    return topServices;
  } else {
    // Adjust last slice percentage slightly if total exceeds 100 due to rounding
    const currentSum = result.reduce((sum, item) => sum + item.value, 0);
    if (currentSum > 100 && result.length > 0) {
      result[result.length - 1].value -= currentSum - 100;
    }
    return result;
  }
}

async function getAnalyticsSummary(startDate: string, endDate: string) {
  // Fetch Bookings Revenue
  const { data: bookingsData, error: bookingsError } = await supabaseAdmin
    .from("bookings")
    .select("service_price")
    .gte("booking_time", startDate)
    .lte("booking_time", endDate);

  if (bookingsError)
    console.error("Error fetching bookings revenue:", bookingsError);

  // Fetch Orders Revenue
  const { data: ordersData, error: ordersError } = await supabaseAdmin
    .from("orders")
    .select("total_price")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (ordersError) console.error("Error fetching orders revenue:", ordersError);

  // Fetch Appointments Count
  const { count: appointmentsCount, error: appointmentsError } =
    await supabaseAdmin
      .from("bookings")
      .select("id", { count: "exact", head: true }) // Efficient count
      .gte("booking_time", startDate)
      .lte("booking_time", endDate);

  if (appointmentsError)
    console.error("Error fetching appointments count:", appointmentsError);

  // Fetch New Clients Count
  const { count: newClientsCount, error: clientsError } = await supabaseAdmin
    .from("profiles")
    .select("user_id", { count: "exact", head: true }) // Efficient count
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (clientsError)
    console.error("Error fetching new clients count:", clientsError);

  // Calculate total revenue
  const serviceRevenue =
    bookingsData?.reduce(
      (sum, booking) => sum + (booking.service_price || 0),
      0
    ) || 0;
  const productRevenue =
    ordersData?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;
  const totalRevenue = serviceRevenue + productRevenue;

  return {
    totalRevenue: `R${totalRevenue.toLocaleString("en-ZA")}`, // Format as Rand
    totalAppointments: appointmentsCount?.toString() || "0",
    newClients: newClientsCount?.toString() || "0",
    productRevenue: `R${productRevenue.toLocaleString("en-ZA")}`, // Format as Rand, clarify it's revenue
  };
}

// --- Main Page Component ---
export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { from, to, timeframe = "year" } = await searchParams;

  let startDate: Date;
  let endDate: Date = new Date();

  const fromParam = from ? parseISO(from) : undefined;
  const toParam = to ? parseISO(to) : undefined;

  // Validate parsed dates
  const validFromParam =
    fromParam && isValid(fromParam) ? fromParam : undefined;
  const validToParam = toParam && isValid(toParam) ? toParam : undefined;

  // Use custom dates ONLY if timeframe is 'custom' AND both dates are valid
  if (timeframe === "custom" && validFromParam && validToParam) {
    startDate = validFromParam;
    endDate = validToParam;
  } else {
    // Calculate dates based on selected timeframe (or default 'year')
    endDate = new Date(); // Reset end date to today for predefined ranges
    switch (timeframe) {
      case "week":
        startDate = startOfWeek(endDate, { weekStartsOn: 1 }); // Monday start
        endDate = endOfWeek(endDate, { weekStartsOn: 1 });
        break;
      case "month":
        startDate = startOfMonth(endDate);
        endDate = endOfMonth(endDate);
        break;
      case "quarter":
        startDate = startOfQuarter(endDate);
        endDate = endOfQuarter(endDate);
        break;
      case "year":
      default: // Default to 'year'
        startDate = startOfYear(endDate);
        endDate = endOfYear(endDate); // End of the current year
        break;
    }
  }

  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();

  const [
    revenueData,
    appointmentData,
    productData,
    revenueDistribution,
    summary,
  ] = await Promise.all([
    getRevenueData(startDateString, endDateString),
    getAppointmentData(startDateString, endDateString),
    getProductData(startDateString, endDateString),
    getRevenueDistribution(startDateString, endDateString),
    getAnalyticsSummary(startDateString, endDateString),
  ]);

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <PageHeader
        title="Analytics"
        description="View insights and performance metrics for the selected period" // Updated description
      />

      {/* Client component for filters */}
      <div className="mb-6">
        <AnalyticsFilters />
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Total Revenue" value={summary.totalRevenue} />
        <StatCard
          title="Total Appointments"
          value={summary.totalAppointments}
        />
        <StatCard title="New Clients" value={summary.newClients} />
        <StatCard title="Product Revenue" value={summary.productRevenue} />
      </div>

      {/* Charts Client Component */}
      <AnalyticsCharts
        revenueData={revenueData}
        appointmentData={appointmentData}
        productData={productData}
        revenueDistribution={revenueDistribution}
        revenueChartConfig={revenueChartConfig}
        appointmentChartConfig={appointmentChartConfig}
        productChartConfig={productChartConfig}
        distributionChartConfig={distributionChartConfig}
      />
    </div>
  );
}

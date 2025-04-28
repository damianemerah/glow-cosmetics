import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DatePicker,
} from "@/constants/ui/index";
import PageHeader from "@/components/admin/page-header";
import StatCard from "@/components/admin/stat-card";
import { createClient } from "@/utils/supabase/server";
import AnalyticsCharts from "@/components/admin/analytics-charts";

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
  value: {
    label: "Revenue",
  },
};

async function getRevenueData() {
  const supabase = await createClient();
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

  // Get bookings data for services revenue
  const { data: bookingsData, error: bookingsError } = await supabase
    .from("bookings")
    .select("booking_time, service_price")
    .gte("booking_time", new Date(new Date().getFullYear(), 0, 1).toISOString()) // From start of year
    .lte("booking_time", new Date().toISOString()); // To current date

  if (bookingsError) {
    console.error("Error fetching bookings data:", bookingsError);
    return [];
  }

  // Get orders data for products revenue
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("created_at, total_price")
    .gte("created_at", new Date(new Date().getFullYear(), 0, 1).toISOString()) // From start of year
    .lte("created_at", new Date().toISOString()); // To current date

  if (ordersError) {
    console.error("Error fetching orders data:", ordersError);
    return [];
  }

  // Initialize revenue data for all months
  const revenueData = months.map((month) => ({
    month,
    services: 0,
    products: 0,
  }));

  // Process bookings data for services revenue
  bookingsData.forEach((booking) => {
    const bookingDate = new Date(booking.booking_time);
    const monthIndex = bookingDate.getMonth();
    revenueData[monthIndex].services += booking.service_price || 0;
  });

  // Process orders data for products revenue
  ordersData.forEach((order) => {
    const orderDate = new Date(order.created_at);
    const monthIndex = orderDate.getMonth();
    revenueData[monthIndex].products += order.total_price || 0;
  });

  return revenueData;
}

async function getAppointmentData() {
  const supabase = await createClient();

  // Get service counts grouped by service name
  const { data, error } = await supabase
    .from("bookings")
    .select("service_name, id")
    .gte(
      "booking_time",
      new Date(new Date().getFullYear(), 0, 1).toISOString()
    );

  if (error) {
    console.error("Error fetching appointment data:", error);
    return [];
  }

  // Count services
  const serviceCounts: Record<string, number> = {};
  data.forEach((booking) => {
    const serviceName = booking.service_name;
    if (serviceName) {
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
    }
  });

  // Convert to array format needed for chart
  return Object.keys(serviceCounts)
    .map((name) => ({ name, count: serviceCounts[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Get top 5 services
}

async function getProductData() {
  const supabase = await createClient();

  // Get product sales by category
  const { data: orderItems, error } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .gte("created_at", new Date(new Date().getFullYear(), 0, 1).toISOString());

  if (error) {
    console.error("Error fetching product data:", error);
    return [];
  }

  // Get product categories
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, category");

  if (productsError) {
    console.error("Error fetching product categories:", productsError);
    return [];
  }

  // Create product ID to category mapping
  const productCategories: Record<string, string> = {};
  products.forEach((product) => {
    productCategories[product.id] = product.category;
  });

  // Count sales by category
  const categoryCounts: Record<string, number> = {};
  let totalSales = 0;

  orderItems.forEach((item) => {
    const category = productCategories[item.product_id] || "Other";
    categoryCounts[category] =
      (categoryCounts[category] || 0) + (item.quantity || 1);
    totalSales += item.quantity || 1;
  });

  // Convert to percentage and array format for chart
  return Object.keys(categoryCounts)
    .map((category) => ({
      name: category
        .replace("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      value: Math.round((categoryCounts[category] / totalSales) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

async function getRevenueDistribution() {
  const supabase = await createClient();

  // Get revenue by service name
  const { data, error } = await supabase
    .from("bookings")
    .select("service_name, service_price")
    .gte(
      "booking_time",
      new Date(new Date().getFullYear(), 0, 1).toISOString()
    );

  if (error) {
    console.error("Error fetching revenue distribution data:", error);
    return [];
  }

  // Calculate total revenue and distribution by service
  const serviceRevenue: Record<string, number> = {};
  let totalRevenue = 0;

  data.forEach((booking) => {
    const serviceName = booking.service_name || "Other";
    const price = booking.service_price || 0;
    serviceRevenue[serviceName] = (serviceRevenue[serviceName] || 0) + price;
    totalRevenue += price;
  });

  // Define colors for the pie chart
  const colors = ["#4CAF50", "#8BC34A", "#CDDC39", "#FFC107", "#FF9800"];

  // Convert to percentage and format for chart
  const result = Object.keys(serviceRevenue)
    .map((name, index) => ({
      name,
      value: Math.round((serviceRevenue[name] / totalRevenue) * 100),
      fill: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value);

  // Group smaller services into "Other Services"
  const topServices = result.slice(0, 4);
  const otherServices = result.slice(4);

  if (otherServices.length > 0) {
    const otherValue = otherServices.reduce((sum, item) => sum + item.value, 0);
    topServices.push({
      name: "Other Services",
      value: otherValue,
      fill: colors[4],
    });
  }

  return topServices;
}

async function getAnalyticsSummary() {
  const supabase = await createClient();
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1).toISOString();

  // Get total revenue from bookings (services)
  const { data: bookingsData, error: bookingsError } = await supabase
    .from("bookings")
    .select("service_price")
    .gte("booking_time", startOfYear);

  if (bookingsError) {
    console.error("Error fetching bookings revenue:", bookingsError);
  }

  // Get total revenue from orders (products)
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("total_price")
    .gte("created_at", startOfYear);

  if (ordersError) {
    console.error("Error fetching orders revenue:", ordersError);
  }

  // Get total appointments
  const { count: appointmentsCount, error: appointmentsError } = await supabase
    .from("bookings")
    .select("id", { count: "exact" })
    .gte("booking_time", startOfYear);

  if (appointmentsError) {
    console.error("Error fetching appointments count:", appointmentsError);
  }

  // Get new clients (profiles created this year)
  const { count: newClientsCount, error: clientsError } = await supabase
    .from("profiles")
    .select("user_id", { count: "exact" })
    .gte("created_at", startOfYear);

  if (clientsError) {
    console.error("Error fetching new clients count:", clientsError);
  }

  // Calculate total revenue
  const serviceRevenue = bookingsData
    ? bookingsData.reduce(
        (sum, booking) => sum + (booking.service_price || 0),
        0
      )
    : 0;
  const productRevenue = ordersData
    ? ordersData.reduce((sum, order) => sum + (order.total_price || 0), 0)
    : 0;
  const totalRevenue = serviceRevenue + productRevenue;

  return {
    totalRevenue: `R${totalRevenue.toLocaleString()}`,
    totalAppointments: appointmentsCount?.toString() || "0",
    newClients: newClientsCount?.toString() || "0",
    productSales: `R${productRevenue.toLocaleString()}`,
  };
}

export default async function AnalyticsPage() {
  // Fetch real data from the database
  const revenueData = await getRevenueData();
  const appointmentData = await getAppointmentData();
  const productData = await getProductData();
  const revenueDistribution = await getRevenueDistribution();
  const summary = await getAnalyticsSummary();

  // Calculate total revenue for pie chart
  const totalRevenue = revenueDistribution.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="View insights and performance metrics"
      />

      <div className="flex justify-end items-center mb-6">
        <div className="flex gap-2 items-center">
          <DatePicker placeholderText="From date" />
          <span>to</span>
          <DatePicker placeholderText="To date" />

          <Select defaultValue="year">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard title="Total Revenue" value={summary.totalRevenue} />
        <StatCard
          title="Total Appointments"
          value={summary.totalAppointments}
        />
        <StatCard title="New Clients" value={summary.newClients} />
        <StatCard title="Product Sales" value={summary.productSales} />
      </div>

      {/* Use client component for charts */}
      <AnalyticsCharts
        revenueData={revenueData}
        appointmentData={appointmentData}
        productData={productData}
        revenueDistribution={revenueDistribution}
        totalRevenue={totalRevenue}
        revenueChartConfig={revenueChartConfig}
        appointmentChartConfig={appointmentChartConfig}
        productChartConfig={productChartConfig}
        distributionChartConfig={distributionChartConfig}
      />
    </div>
  );
}

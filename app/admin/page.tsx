import Link from "next/link";
import { Calendar, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/admin/page-header";
import StatCard from "@/components/admin/stat-card";
import DataTable from "@/components/admin/data-table";
import { createClient } from "@/utils/supabase/server";
import { type SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { capitalize, formatZAR } from "@/utils";
import { getUpcomingBirthdays } from "@/actions/clientActions";
import { BirthdayReminder } from "@/components/birthday-reminder";

// Function to get dashboard statistics
async function getDashboardStats() {
  const supabase = await createClient();

  const getStats = unstable_cache(
    async (client: SupabaseClient) => {
      // Get today's bookings count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: todayBookingsCount } = await client
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .gte("booking_time", today.toISOString())
        .lt("booking_time", tomorrow.toISOString());

      // Get weekly sales
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const { data: weeklyOrders } = await client
        .from("orders")
        .select("total_price")
        .gte("created_at", weekStart.toISOString());

      const weeklySales = weeklyOrders
        ? weeklyOrders.reduce((sum, order) => sum + (order.total_price || 0), 0)
        : 0;

      // Get active clients count
      const { count: activeClientsCount } = await client
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      return {
        todayBookingsCount: todayBookingsCount || 0,
        weeklySales,
        activeClientsCount: activeClientsCount || 0,
      };
    },
    ["dashboard-stats"],
    {
      revalidate: 10, // Cache for 5 minutes
      tags: ["dashboard"],
    }
  );

  return getStats(supabase);
}

// Function to get recent activity
async function getRecentActivity() {
  const supabase = await createClient();

  const getActivity = unstable_cache(
    async (client: SupabaseClient) => {
      // Get recent bookings
      const { data: recentBookings } = await client
        .from("bookings")
        .select("id, booking_time, first_name, last_name, service_id")
        .order("created_at", { ascending: false })
        .limit(3);

      // Get recent orders
      const { data: recentOrders } = await client
        .from("orders")
        .select("id, created_at, first_name, last_name, total_price")
        .order("created_at", { ascending: false })
        .limit(3);

      // Combine and format activities
      const bookingActivities = (recentBookings || []).map((booking) => ({
        client: `${capitalize(booking.first_name)} ${capitalize(booking.last_name)}`,
        action: `Booked ${booking.service_id}`,
        time: new Date(booking.booking_time).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
        type: "booking",
      }));

      const orderActivities = (recentOrders || []).map((order) => ({
        client: `${capitalize(order.first_name)} ${capitalize(order.last_name)}`,
        action: `Placed Order (${formatZAR(order.total_price)})`,
        time: new Date(order.created_at).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
        type: "order",
      }));

      // Combine and sort by time (most recent first)
      return [...bookingActivities, ...orderActivities]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);
    },
    ["recent-activity"],
    {
      revalidate: 60, // Cache for 1 minute
      tags: ["bookings", "orders"],
    }
  );

  return getActivity(supabase);
}

export default async function DashboardPage() {
  const { todayBookingsCount, weeklySales, activeClientsCount } =
    await getDashboardStats();
  const recentActivity = await getRecentActivity();

  // Fetch users with birthdays in 4 days
  const daysAhead = 4;
  const birthdayResult = await getUpcomingBirthdays();
  console.log(birthdayResult, "Birthday Result");
  const upcomingBirthdays = birthdayResult.success ? birthdayResult.users : [];

  const activityColumns = [
    { key: "client", title: "Client" },
    { key: "action", title: "Action" },
    { key: "time", title: "Time" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your beauty and wellness business"
      />

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <StatCard
          title="Today's Bookings"
          value={todayBookingsCount.toString()}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Weekly Sales"
          value={`${formatZAR(weeklySales)}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          title="Active Clients"
          value={activeClientsCount.toString()}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <BirthdayReminder
        upcomingBirthdays={upcomingBirthdays}
        daysAhead={daysAhead}
      />

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 font-montserrat">
          Recent Activity
        </h2>
        <DataTable columns={activityColumns} data={recentActivity} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Button
          asChild
          className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform"
        >
          <Link href="/admin/appointments">Add Appointment</Link>
        </Button>
        <Button
          asChild
          className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform"
        >
          <Link href="/admin/products">Add Product</Link>
        </Button>
        <Button
          asChild
          className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform"
        >
          <Link href="/admin/messaging">Send Message</Link>
        </Button>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { type SupabaseClient } from "@supabase/supabase-js";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Supabase Utils
import { createClient } from "@/utils/supabase/server";

// Dynamic Imports (Streaming)
const ProfileSection = dynamic(
  () => import("@/components/dashboard/profile-section")
);
const UpcomingBookings = dynamic(
  () => import("@/components/dashboard/upcoming-bookings")
);

const BookingsList = dynamic(
  () => import("@/components/dashboard/bookings-list")
);
const ProductRecommendations = dynamic(
  () => import("@/components/dashboard/product-recommendations")
);
const OrderHistory = dynamic(
  () => import("@/components/dashboard/order-history")
);
const AccountSettings = dynamic(
  () => import("@/components/dashboard/account-settings")
);

const ProfileSectionFallback = () => (
  <div className="space-y-3">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  </div>
);

const UpcomingBookingsFallback = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex justify-between p-4 border rounded-md">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <Skeleton className="h-8 w-[100px]" />
      </div>
    ))}
  </div>
);

const ProductRecommendationsFallback = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="border rounded-md p-4">
        <Skeleton className="h-40 w-full rounded-md mb-3" />
        <Skeleton className="h-4 w-[150px] mb-2" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    ))}
  </div>
);

const OrderHistoryFallback = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-4 border rounded-md">
        <div className="flex justify-between mb-3">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    ))}
  </div>
);

const BookingsListFallback = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex justify-between p-4 border rounded-md">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
        <Skeleton className="h-8 w-[100px]" />
      </div>
    ))}
  </div>
);

export const revalidate = 60;

/* ─────────── INLINE ASYNC DATA FETCHING COMPONENTS ─────────── */

async function requireAuth(supabase: SupabaseClient) {
  const { data: session, error } = await supabase.auth.getUser();

  if (!session?.user) {
    redirect("/");
  }

  return { session, error };
}

async function ProfileData() {
  const supabase = await createClient();
  const { session, error } = await requireAuth(supabase);

  const profile = await getProfileData(session.user.id);
  return <ProfileSection profile={profile} initialError={!!error} />;
}

async function AccountSettingsData() {
  const supabase = await createClient();
  const { session } = await requireAuth(supabase);

  const profile = await getProfileData(session.user.id);

  const marketingEnabled = profile.marketing_notification_enabled;
  const appointmentEnabled = profile.appointment_reminder;
  const birthdayEnabled = profile.birthday_notification_enabled;
  const userId = profile.user_id;

  return (
    <AccountSettings
      marketingEnabled={marketingEnabled}
      appointmentEnabled={appointmentEnabled}
      birthdayEnabled={birthdayEnabled}
      user_id={userId}
    />
  );
}

async function OrdersData() {
  const supabase = await createClient();
  const { session, error } = await requireAuth(supabase);

  const orders = await getOrdersData(session.user.id);
  return <OrderHistory orders={orders} initialError={!!error} />;
}

async function BookingsData() {
  const supabase = await createClient();
  const { session } = await requireAuth(supabase);

  try {
    const bookings = await getBookingsData(session.user.id);
    return <UpcomingBookings bookings={bookings} initialError={false} />;
  } catch (error) {
    console.error("Error loading bookings:", error);
    return <UpcomingBookings bookings={[]} initialError={true} />;
  }
}
async function BookingsListData() {
  const supabase = await createClient();
  const { session } = await requireAuth(supabase);

  try {
    const bookings = await getBookingsData(session.user.id);
    return <BookingsList bookings={bookings} initialError={false} />;
  } catch (error) {
    console.error("Error loading bookings:", error);
    return <BookingsList bookings={[]} initialError={true} />;
  }
}

async function RecommendationsData() {
  const recommendations = await getRecommendationsData();
  return (
    <ProductRecommendations products={recommendations} initialError={false} />
  );
}

async function getProfileData(userId: string) {
  const supabase = await createClient();

  const getProfile = unstable_cache(
    async (uid: string, client: SupabaseClient) => {
      const { data: profile } = await client
        .from("profiles")
        .select("*")
        .eq("user_id", uid)
        .single();
      return profile;
    },
    [`profile-${userId}`],
    {
      revalidate: 60,
      tags: [`profile-${userId}`],
    }
  );

  return getProfile(userId, supabase);
}

async function getOrdersData(userId: string) {
  const supabase = await createClient();

  const getOrders = unstable_cache(
    async (uid: string, client: SupabaseClient) => {
      const { data: orders } = await client
        .from("orders")
        .select("*, items:order_items(*, product:products(*))")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      console.log("Orders:", orders);

      return orders || [];
    },
    [`orders-${userId}`],
    {
      revalidate: 60,
      tags: [`orders-${userId}`],
    }
  );

  return getOrders(userId, supabase);
}

async function getBookingsData(userId: string) {
  const supabase = await createClient();

  const getBookings = unstable_cache(
    async (uid: string, client: SupabaseClient) => {
      const { data: bookings } = await client
        .from("bookings")
        .select("*")
        .eq("user_id", uid)
        .order("booking_time", { ascending: true });
      return bookings || [];
    },
    [`bookings-${userId}`],
    {
      revalidate: 60,
      tags: [`bookings-${userId}`],
    }
  );

  return getBookings(userId, supabase);
}

async function getRecommendationsData() {
  const supabase = await createClient();

  const getRecommendations = unstable_cache(
    async (client: SupabaseClient) => {
      const { data: recommendations } = await client
        .from("products")
        .select("*")
        .eq("is_bestseller", true)
        .limit(3);
      return recommendations || [];
    },
    ["product-recommendations"],
    {
      revalidate: 300,
      tags: ["products"],
    }
  );

  return getRecommendations(supabase);
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 font-montserrat">
          My Dashboard
        </h1>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ProfileSectionFallback />}>
                  <ProfileData />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>
                  Your next scheduled appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<UpcomingBookingsFallback />}>
                  <BookingsData />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended For You</CardTitle>
                <CardDescription>
                  Products we think you&apos;ll love
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ProductRecommendationsFallback />}>
                  <RecommendationsData />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View all your past orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<OrderHistoryFallback />}>
                  <OrdersData />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>Manage your appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<BookingsListFallback />}>
                  <BookingsListData />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense
                  fallback={<Skeleton className="h-24 w-full rounded-md" />}
                >
                  <AccountSettingsData />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

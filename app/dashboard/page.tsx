import { Suspense, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { type SupabaseClient } from "@supabase/supabase-js";
import DashboardTabs from "@/components/dashboard/dashboard-tabs";
import { SWRConfig } from "swr";
import { WishlistSkeleton } from "@/components/dashboard/wishlist";
import {
  ArrowUpRight,
  CalendarHeart,
  Heart,
  LayoutGrid,
  Package,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/constants/ui/index";

// Supabase Utils
import { createClient } from "@/utils/supabase/server";

// Dynamic Imports (Streaming)
const ProfileSection = dynamic(
  () => import("@/components/dashboard/profile-section"),
);
const UpcomingBookings = dynamic(
  () => import("@/components/dashboard/upcoming-bookings"),
);

const BookingsList = dynamic(
  () => import("@/components/dashboard/bookings-list"),
);
const ProductRecommendations = dynamic(
  () => import("@/components/dashboard/product-recommendations"),
);
const OrderHistory = dynamic(
  () => import("@/components/dashboard/order-history"),
);
const AccountSettings = dynamic(
  () => import("@/components/dashboard/account-settings"),
);
const Wishlist = dynamic(() => import("@/components/dashboard/wishlist"));

const ProfileSectionFallback = () => (
  <div className="flex items-center gap-6">
    <Skeleton className="h-20 w-20 rounded-full md:h-24 md:w-24" />
    <div className="flex-1 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="h-4 w-48" />
    </div>
  </div>
);

const RowsFallback = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
        <Skeleton className="h-14 w-14 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
);

const ProductGridFallback = () => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
    {[1, 2, 3].map((i) => (
      <WishlistSkeleton key={i} />
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

  const marketingEnabled = profile.receive_emails;
  const appointmentEnabled = profile.appointment_reminder;
  const userId = profile.user_id;

  return (
    <AccountSettings
      marketingEnabled={marketingEnabled}
      appointmentEnabled={appointmentEnabled}
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
    const now = new Date();
    const upcoming = bookings.filter(
      (booking) =>
        new Date(booking.booking_time) >= now && booking.status !== "cancelled",
    );
    return (
      <UpcomingBookings bookings={upcoming.slice(0, 4)} initialError={false} />
    );
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
    },
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

      return orders || [];
    },
    [`orders-${userId}`],
    {
      revalidate: 60,
      tags: [`orders-${userId}`],
    },
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
    },
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
    },
  );

  return getRecommendations(supabase);
}

async function getWishlistData(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("wishlists")
    .select(
      "id, user_id, product_id, created_at, products:products(id, name, price, image_url, slug, stock_quantity, is_bestseller, compare_price)",
    )
    .eq("user_id", userId);

  // Transform data to match the expected format for the Wishlist component
  const formattedData =
    data?.map((item) => ({
      ...item,
      products: Array.isArray(item.products) ? item.products[0] : item.products,
    })) || [];

  return formattedData;
}

async function WishlistData() {
  const supabase = await createClient();
  const { session } = await requireAuth(supabase);

  const wishlistData = await getWishlistData(session.user.id);

  // Create fallback data for SWR to use initially
  const fallbackData = {
    userWishlist: wishlistData,
  };

  return (
    <SWRConfig value={{ fallback: fallbackData }}>
      <Wishlist />
    </SWRConfig>
  );
}

function Panel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-end justify-between gap-4 space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="font-heading text-2xl font-medium">
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const tabs = [
  { value: "overview", label: "Overview", icon: LayoutGrid },
  { value: "orders", label: "Orders", icon: Package },
  { value: "bookings", label: "Bookings", icon: CalendarHeart },
  { value: "wishlists", label: "Wishlist", icon: Heart },
  { value: "settings", label: "Settings", icon: Settings },
];

const quickLinks = [
  {
    href: "/booking",
    label: "Book a treatment",
    description: "Brows, lashes, makeup & more",
    icon: CalendarHeart,
  },
  {
    href: "/products",
    label: "Shop products",
    description: "Skincare, makeup & supplements",
    icon: ShoppingBag,
  },
  {
    href: "#wishlists",
    label: "Your wishlist",
    description: "Pieces you've saved for later",
    icon: Heart,
  },
  {
    href: "#orders",
    label: "Track orders",
    description: "Order history and status",
    icon: Package,
  },
];

export default function DashboardPage() {
  return (
    <div className="pb-20">
      <DashboardTabs defaultValue="overview">
        <section className="border-b bg-secondary/60">
          <div className="container mx-auto max-w-6xl px-4 pt-10 md:pt-14">
            <p className="eyebrow text-primary">Your account</p>
            <h1 className="mt-2 font-heading text-4xl font-medium text-foreground md:text-5xl">
              My Dashboard
            </h1>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Manage your appointments, orders, saved favourites and preferences
              in one place.
            </p>

            <TabsList className="-mb-px mt-8 flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0 [scrollbar-width:none]">
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    "flex-none rounded-none border-b-2 border-transparent px-4 py-3 text-sm text-muted-foreground shadow-none transition-colors hover:text-foreground",
                    "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl px-4 pt-8 md:pt-10">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-highlight to-primary" />
              <CardContent className="p-6 md:p-8">
                <Suspense fallback={<ProfileSectionFallback />}>
                  <ProfileData />
                </Suspense>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              <Panel
                title="Upcoming appointments"
                description="Your next scheduled treatments"
                className="lg:col-span-2"
              >
                <Suspense fallback={<RowsFallback />}>
                  <BookingsData />
                </Suspense>
              </Panel>

              <Panel title="Quick links">
                <ul className="-mx-2 space-y-1">
                  {quickLinks.map(
                    ({ href, label, description, icon: Icon }) => {
                      // Hash links switch tabs via the hashchange listener, which
                      // next/link's pushState wouldn't trigger.
                      const Anchor = href.startsWith("#") ? "a" : Link;
                      return (
                        <li key={href}>
                          <Anchor
                            href={href}
                            className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-foreground">
                                {label}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {description}
                              </span>
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                          </Anchor>
                        </li>
                      );
                    },
                  )}
                </ul>
              </Panel>
            </div>

            <Panel
              title="Recommended for you"
              description="Bestsellers we think you'll love"
              action={
                <Link
                  href="/products"
                  className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:inline"
                >
                  Shop all
                </Link>
              }
            >
              <Suspense fallback={<ProductGridFallback />}>
                <RecommendationsData />
              </Suspense>
            </Panel>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Panel title="Order history" description="All of your past orders">
              <Suspense fallback={<RowsFallback />}>
                <OrdersData />
              </Suspense>
            </Panel>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Panel
              title="All bookings"
              description="Upcoming and past appointments"
            >
              <Suspense fallback={<RowsFallback />}>
                <BookingsListData />
              </Suspense>
            </Panel>
          </TabsContent>

          {/* Wishlists Tab */}
          <TabsContent value="wishlists">
            <Panel
              title="My wishlist"
              description="Products you've saved for later"
            >
              <Suspense fallback={<ProductGridFallback />}>
                <WishlistData />
              </Suspense>
            </Panel>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="max-w-3xl">
            <Suspense
              fallback={<Skeleton className="h-64 w-full rounded-xl" />}
            >
              <AccountSettingsData />
            </Suspense>
          </TabsContent>
        </div>
      </DashboardTabs>
    </div>
  );
}

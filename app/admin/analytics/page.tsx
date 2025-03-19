"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/admin/page-header";
import StatCard from "@/components/admin/stat-card";
import { BarChart2, PieChart, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  Label,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DatePicker } from "@/components/ui/date-picker";

// Mock data for revenue analysis - both services and products
const revenueData = [
  { month: "Jan", services: 3200, products: 1000 },
  { month: "Feb", services: 3500, products: 1300 },
  { month: "Mar", services: 4000, products: 1500 },
  { month: "Apr", services: 3800, products: 1400 },
  { month: "May", services: 4500, products: 1600 },
  { month: "Jun", services: 5100, products: 1900 },
  { month: "Jul", services: 4900, products: 1900 },
  { month: "Aug", services: 5300, products: 1900 },
  { month: "Sep", services: 5800, products: 2000 },
  { month: "Oct", services: 6200, products: 2300 },
  { month: "Nov", services: 6800, products: 2400 },
  { month: "Dec", services: 7300, products: 2500 },
];

// Mock data for appointment counts by service
const appointmentData = [
  { name: "Microblading", count: 76 },
  { name: "Facial Treatment", count: 54 },
  { name: "Lip Filler", count: 48 },
  { name: "Wrinkle Relaxer", count: 32 },
  { name: "Lash Extensions", count: 28 },
];

// Mock data for product sales by category
const productData = [
  { name: "Skin Care", value: 45 },
  { name: "Lip Products", value: 25 },
  { name: "Supplements", value: 20 },
  { name: "Body Care", value: 10 },
];

// Mock data for revenue distribution by service for pie chart
const revenueDistribution = [
  { name: "Microblading", value: 35, fill: "#4CAF50" },
  { name: "Facial Treatment", value: 25, fill: "#8BC34A" },
  { name: "Lip Filler", value: 20, fill: "#CDDC39" },
  { name: "Wrinkle Relaxer", value: 15, fill: "#FFC107" },
  { name: "Other Services", value: 5, fill: "#FF9800" },
];

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

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("year");
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1), // Jan 1 of current year
    to: new Date(),
  });
  const [filteredData, setFilteredData] = useState({
    revenue: revenueData,
    appointments: appointmentData,
    products: productData,
  });

  // Filter data when date range changes
  useEffect(() => {
    // Filter revenue data based on dateRange
    const filterDataByDateRange = () => {
      // For demo purposes, we're just using the original data
      // In a real app, you would filter based on dateRange.from and dateRange.to

      // Example filtering logic (assuming data has actual dates):
      // const filtered = revenueData.filter(item => {
      //   const itemDate = new Date(item.date);
      //   return itemDate >= dateRange.from && itemDate <= dateRange.to;
      // });

      setFilteredData({
        revenue: revenueData,
        appointments: appointmentData,
        products: productData,
      });
    };

    filterDataByDateRange();
  }, [dateRange]);

  // Calculate total revenue for pie chart
  const totalRevenue = useMemo(() => {
    return revenueDistribution.reduce((sum, item) => sum + item.value, 0);
  }, []);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="View insights and performance metrics"
      />

      <div className="flex justify-between items-center mb-6">
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-[400px]"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2 items-center">
          <DatePicker
            selected={dateRange.from}
            onSelect={(date) =>
              setDateRange((prev) => ({ ...prev, from: date || prev.from }))
            }
            placeholderText="From date"
          />
          <span>to</span>
          <DatePicker
            selected={dateRange.to}
            onSelect={(date) =>
              setDateRange((prev) => ({ ...prev, to: date || prev.to }))
            }
            placeholderText="To date"
            minDate={dateRange.from}
          />

          <Select value={timeframe} onValueChange={setTimeframe}>
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
        <StatCard title="Total Revenue" value="R98,450" />
        <StatCard title="Total Appointments" value="543" />
        <StatCard title="New Clients" value="87" />
        <StatCard title="Product Sales" value="R42,350" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Services vs Product Sales</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 h-96">
            <ChartContainer config={revenueChartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData.revenue}
                  margin={{ left: 10, right: 10, top: 20, bottom: 10 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `R${value}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `R${value.toLocaleString()}`}
                        indicator="dashed"
                      />
                    }
                  />
                  <Bar
                    dataKey="services"
                    fill="var(--color-services)"
                    radius={[4, 4, 0, 0]}
                    name="Service Revenue"
                    barSize={20}
                  />
                  <Bar
                    dataKey="products"
                    fill="var(--color-products)"
                    radius={[4, 4, 0, 0]}
                    name="Product Sales"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Trending up by 12.4% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Revenue from services consistently outperforms product sales
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Revenue Distribution</CardTitle>
              <CardDescription>By service type</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <PieChart className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 h-96">
            <ChartContainer
              config={distributionChartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${value}%`}
                        nameKey="name"
                        labelKey="name"
                      />
                    }
                  />
                  <Pie
                    data={revenueDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {revenueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {totalRevenue}%
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-muted-foreground text-xs"
                              >
                                Total Revenue
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                    />
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              Microblading is our highest revenue service
            </div>
            <div className="leading-none text-muted-foreground">
              Consider expanding offerings in this category
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Appointments by Service</CardTitle>
              <CardDescription>
                Number of bookings per service type
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 h-96">
            <ChartContainer config={appointmentChartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData.appointments}
                  layout="vertical"
                  margin={{ left: 10, right: 10, top: 20, bottom: 20 }}
                >
                  <CartesianGrid horizontal={true} vertical={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={120}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                    content={
                      <ChartTooltipContent
                        nameKey="name"
                        indicator="dashed"
                        formatter={(value) => `${value} appointments`}
                      />
                    }
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={4}
                    name="Appointments"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Sales by product category</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <BarChart2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 h-96">
            <ChartContainer config={productChartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredData.products}
                  margin={{ left: 10, right: 10, top: 20, bottom: 10 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                    content={
                      <ChartTooltipContent
                        nameKey="name"
                        indicator="dashed"
                        formatter={(value) => `${value}%`}
                      />
                    }
                  />
                  <Bar
                    dataKey="value"
                    fill="var(--color-value)"
                    radius={4}
                    name="Sales Percentage"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

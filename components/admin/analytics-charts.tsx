"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/constants/ui/index"; // Ensure this path is correct
import { BarChart2, PieChart as PieIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend, // Added Legend
} from "recharts";

// Interfaces for data types
interface RevenueDataItem {
  month: string;
  services: number;
  products: number;
}

interface AppointmentDataItem {
  name: string;
  count: number;
}

interface ProductDataItem {
  name: string;
  value: number; // Percentage value
}

interface RevenueDistributionItem {
  name: string;
  value: number; // Percentage value
  fill: string;
}

// Interface for chart configurations
interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

// Props for the component
interface AnalyticsChartsProps {
  revenueData: RevenueDataItem[];
  appointmentData: AppointmentDataItem[];
  productData: ProductDataItem[];
  revenueDistribution: RevenueDistributionItem[];
  // totalRevenue prop removed as it wasn't used correctly for the pie chart label
  revenueChartConfig: ChartConfig;
  appointmentChartConfig: ChartConfig;
  productChartConfig: ChartConfig;
  distributionChartConfig: ChartConfig;
}

export default function AnalyticsCharts({
  revenueData,
  appointmentData,
  productData,
  revenueDistribution,
  revenueChartConfig,
  appointmentChartConfig,
  productChartConfig,
  distributionChartConfig, // This might be less necessary now but kept for potential styling
}: AnalyticsChartsProps) {
  // Determine if there's data to show for charts to avoid rendering empty states badly
  const hasRevenueData =
    revenueData && revenueData.some((d) => d.services > 0 || d.products > 0);
  const hasAppointmentData = appointmentData && appointmentData.length > 0;
  const hasProductData = productData && productData.length > 0;
  const hasDistributionData =
    revenueDistribution && revenueDistribution.length > 0;

  return (
    <>
      {/* Revenue Breakdown & Distribution Row */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {/* Revenue Breakdown Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Services vs Product Sales</CardDescription>
            </div>
            <BarChart2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-4 h-96">
            {hasRevenueData ? (
              <ChartContainer config={revenueChartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueData}
                    margin={{ left: 10, right: 10, top: 20, bottom: 10 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      tickFormatter={(value) => `R${value / 1000}k`} // Format as thousands
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={40} // Adjust width for labels
                    />
                    <ChartTooltip
                      cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                      content={
                        <ChartTooltipContent
                          formatter={(value) =>
                            `R${value.toLocaleString("en-ZA")}`
                          }
                          indicator="dashed"
                        />
                      }
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                      dataKey="services"
                      fill="var(--color-services)"
                      radius={[4, 4, 0, 0]}
                      name="Service Revenue" // Legend name
                      stackId="a" // Stack bars if desired
                    />
                    <Bar
                      dataKey="products"
                      fill="var(--color-products)"
                      radius={[4, 4, 0, 0]}
                      name="Product Revenue" // Legend name
                      stackId="a" // Stack bars if desired
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No revenue data for selected period.
              </div>
            )}
          </CardContent>
          {/* Static footer can be added back if needed */}
        </Card>

        {/* Revenue Distribution Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Revenue Distribution</CardTitle>
              <CardDescription>By service type (percentage)</CardDescription>
            </div>
            <PieIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-4 h-96 flex items-center justify-center">
            {hasDistributionData ? (
              <ChartContainer
                config={distributionChartConfig}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => [`${value}%`, name]}
                          nameKey="name"
                          indicator="dot"
                        />
                      }
                    />
                    <Pie
                      data={revenueDistribution}
                      dataKey="value" // This is the percentage
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      labelLine={false}
                    >
                      {revenueDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      height={36}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No service revenue data for selected period.
              </div>
            )}
          </CardContent>
          {/* Static footer can be added back if needed */}
        </Card>
      </div>

      {/* Appointments & Product Categories Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Appointments by Service Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Top 5 Appointments</CardTitle>
              <CardDescription>By service type booking count</CardDescription>
            </div>
            <BarChart2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-4 h-96">
            {hasAppointmentData ? (
              <ChartContainer config={appointmentChartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={appointmentData}
                    layout="vertical"
                    margin={{ left: 10, right: 10, top: 5, bottom: 5 }} // Adjust margins
                  >
                    <CartesianGrid horizontal={true} vertical={false} />
                    <XAxis type="number" hide />{" "}
                    {/* Hide X axis labels if space is tight */}
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={120} // Adjust width based on longest name
                      fontSize={12}
                    />
                    <ChartTooltip
                      cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
                      content={
                        <ChartTooltipContent
                          nameKey="name"
                          indicator="dashed"
                          formatter={(value) => `${value} bookings`}
                        />
                      }
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--color-count)"
                      radius={4}
                      name="Bookings"
                      label={{ position: "right", fill: "#666", fontSize: 12 }} // Add labels on bars
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No appointment data for selected period.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Categories Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Sales percentage by category</CardDescription>
            </div>
            <BarChart2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-4 h-96">
            {hasProductData ? (
              <ChartContainer config={productChartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productData}
                    margin={{ left: 10, right: 10, top: 20, bottom: 10 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      fontSize={12}
                      // Consider rotating labels if they overlap: angle={-45} textAnchor="end" height={50}
                    />
                    <YAxis
                      tickFormatter={(value) => `${value}%`}
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={40}
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
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                      dataKey="value"
                      fill="var(--color-value)"
                      radius={4}
                      name="Sales %" // Legend name
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No product sales data for selected period.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

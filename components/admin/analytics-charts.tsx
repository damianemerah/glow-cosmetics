"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/constants/ui/index";
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
  value: number;
}

interface RevenueDistributionItem {
  name: string;
  value: number;
  fill: string;
}

interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

interface AnalyticsChartsProps {
  revenueData: RevenueDataItem[];
  appointmentData: AppointmentDataItem[];
  productData: ProductDataItem[];
  revenueDistribution: RevenueDistributionItem[];
  totalRevenue: number;
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
  totalRevenue,
  revenueChartConfig,
  appointmentChartConfig,
  productChartConfig,
  distributionChartConfig,
}: AnalyticsChartsProps) {
  return (
    <>
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
                  data={revenueData}
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
              {revenueDistribution[0]?.name || "Service"} is our highest revenue
              service
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
                  accessibilityLayer
                  data={appointmentData}
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
                  // accessibilityLayer
                  data={productData}
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
    </>
  );
}

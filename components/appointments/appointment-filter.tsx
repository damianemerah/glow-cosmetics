"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DateType = "all" | "today" | "week" | "month";

interface AppointmentFilterProps {
  onAddAppointmentClick: () => void;
  search: string;
  date: DateType;
  status: string;
}

// Define booking status options
const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

export default function AppointmentFilter({
  onAddAppointmentClick,
  search,
  status,
  date,
}: AppointmentFilterProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(search || "");
  const [dateFilter, setDateFilter] = useState<DateType>(date || "all");
  const [statusFilter, setStatusFilter] = useState<string>(status || "all");

  const handleFilter = (type: "search" | "status" | "date", val: string) => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    if (type === "search") {
      setSearchQuery(val);
      if (val) {
        params.set("search", val);
      } else {
        params.delete("search");
      }
    }
    if (type === "status") {
      setStatusFilter(val);
      if (val !== "all") {
        params.set("status", val);
      } else {
        params.delete("status");
      }
    }
    if (type === "date") {
      setDateFilter(val as DateType);
      if (val !== "all") {
        params.set("date", val);
      } else {
        params.delete("date");
      }
    }
    const paramsString = params.toString();
    const newUrl = `/admin/appointments${
      paramsString ? `?${paramsString}` : ""
    }`;
    router.push(newUrl, { scroll: false });
  };
  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={dateFilter === "today" ? "default" : "outline"}
            onClick={() => handleFilter("date", "today")}
          >
            Today
          </Button>
          <Button
            variant={dateFilter === "week" ? "default" : "outline"}
            onClick={() => handleFilter("date", "week")}
          >
            This Week
          </Button>
          <Button
            variant={dateFilter === "month" ? "default" : "outline"}
            onClick={() => handleFilter("date", "month")}
          >
            This Month
          </Button>
          <Button
            variant={dateFilter === "all" ? "default" : "outline"}
            onClick={() => handleFilter("date", "all")}
          >
            All
          </Button>
        </div>

        <Button
          className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform"
          onClick={onAddAppointmentClick}
        >
          Add Appointment
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="w-full md:w-64">
          <Input
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => handleFilter("search", e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-40">
          <Select
            value={statusFilter}
            onValueChange={(val) => handleFilter("status", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

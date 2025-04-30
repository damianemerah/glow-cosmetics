"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/constants/ui/index"; // Ensure this path is correct
import { DatePicker } from "@/components/ui/date-picker"; // Import your DatePicker
import { Button } from "@/components/ui/button";
import {
  formatISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  parseISO,
  isValid,
} from "date-fns"; // Added parseISO and isValid

// Helper to format date for URL param (YYYY-MM-DD)
const formatDateForUrl = (date: Date | null | undefined): string => {
  return date && isValid(date)
    ? formatISO(date, { representation: "date" })
    : "";
};

// Helper to parse date from URL param
const parseDateFromUrl = (
  dateString: string | null | undefined
): Date | undefined => {
  if (!dateString) return undefined;
  const parsed = parseISO(dateString); // Use parseISO which handles YYYY-MM-DD
  return isValid(parsed) ? parsed : undefined;
};

export default function AnalyticsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- State Initialization from URL Params ---
  const initialTimeframe = searchParams.get("timeframe") || "year";
  const initialFrom = parseDateFromUrl(searchParams.get("from"));
  const initialTo = parseDateFromUrl(searchParams.get("to"));

  const [timeframe, setTimeframe] = useState<string>(initialTimeframe);
  const [fromDate, setFromDate] = useState<Date | undefined>(initialFrom);
  const [toDate, setToDate] = useState<Date | undefined>(initialTo);
  // Determine if custom range is active based on timeframe or existence of valid dates from URL
  const [isCustomRange, setIsCustomRange] = useState<boolean>(
    initialTimeframe === "custom" && !!initialFrom && !!initialTo
  );

  // --- Update Dates based on Timeframe ---
  useEffect(() => {
    // Only update dates if timeframe changes and it's not 'custom'
    // Or if initializing and no custom dates were set from URL
    if (timeframe === "custom") return; // Let manual date selection handle 'custom'

    let start: Date;
    let end: Date = new Date(); // Default end to today

    switch (timeframe) {
      case "week":
        start = startOfWeek(end, { weekStartsOn: 1 }); // Monday
        end = endOfWeek(end, { weekStartsOn: 1 });
        break;
      case "month":
        start = startOfMonth(end);
        end = endOfMonth(end);
        break;
      case "quarter":
        start = startOfQuarter(end);
        end = endOfQuarter(end);
        break;
      case "year":
      default:
        start = startOfYear(end);
        end = endOfYear(end); // End of the current year
        break;
    }
    setFromDate(start);
    setToDate(end);
    setIsCustomRange(false); // Selecting a predefined timeframe means it's not custom
  }, [timeframe]); // Re-run only when timeframe changes

  // --- Handle Filter Application ---
  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams.toString());

    // Set timeframe
    newParams.set("timeframe", timeframe);

    // Set dates based on current state
    const fromStr = formatDateForUrl(fromDate);
    const toStr = formatDateForUrl(toDate);

    if (fromStr) {
      newParams.set("from", fromStr);
    } else {
      newParams.delete("from");
    }
    if (toStr) {
      newParams.set("to", toStr);
    } else {
      newParams.delete("to");
    }

    router.push(`/admin/analytics?${newParams.toString()}`, { scroll: false });
  };

  // Update timeframe state and trigger date calculation
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    if (value === "custom") {
      setIsCustomRange(true); // Allow custom selection
    } else {
      setIsCustomRange(false); // Predefined range selected
      // The useEffect hook will handle setting dates for predefined ranges
    }
  };

  // Handle custom date changes
  const handleDateChange = (date: Date | undefined, type: "from" | "to") => {
    if (type === "from") {
      setFromDate(date);
    } else {
      setToDate(date);
    }
    // If user selects a date, ensure timeframe reflects it's custom
    setTimeframe("custom");
    setIsCustomRange(true);
  };

  return (
    <div className="flex flex-wrap justify-end items-center gap-2">
      {/* *** CORRECTION HERE *** */}
      <DatePicker
        selected={fromDate} // Use 'selected' prop
        onSelect={(date) => handleDateChange(date, "from")} // Use 'onSelect' prop
        placeholderText="From date"
        maxDate={toDate} // Prevent 'from' being after 'to'
      />
      <span>to</span>
      {/* *** CORRECTION HERE *** */}
      <DatePicker
        selected={toDate} // Use 'selected' prop
        onSelect={(date) => handleDateChange(date, "to")} // Use 'onSelect' prop
        placeholderText="To date"
        minDate={fromDate} // Prevent 'to' being before 'from'
      />

      <Select value={timeframe} onValueChange={handleTimeframeChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select timeframe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          {/* Allow selecting custom only if dates are set */}
          <SelectItem value="custom" disabled={!isCustomRange}>
            Custom Range
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        onClick={applyFilters}
        disabled={timeframe === "custom" && (!fromDate || !toDate)}
      >
        {/* Disable Apply if custom range is selected but incomplete */}
        Apply Filters
      </Button>
    </div>
  );
}

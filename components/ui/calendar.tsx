"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, useDayPicker, useNavigation } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CustomCaptionProps {
  displayMonth: Date;
}

const CustomCaption = React.memo(function CustomCaption({
  displayMonth,
}: CustomCaptionProps) {
  const { fromYear, toYear } = useDayPicker(); // Access DayPicker context
  const { goToMonth } = useNavigation(); // Function to change the month

  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();

  // Memoize year range calculations
  const years = React.useMemo(() => {
    const startYear = fromYear || currentYear - 50;
    const endYear = toYear || currentYear + 50;
    return Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i
    );
  }, [fromYear, toYear, currentYear]);

  // Memoize month names generation
  const monthNames = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) =>
      new Intl.DateTimeFormat("en-US", { month: "long" }).format(
        new Date(2000, i, 1)
      )
    );
  }, []);

  // Memoize handlers to prevent unnecessary re-renders
  const handleMonthChange = React.useCallback(
    (value: string) => {
      const newMonth = monthNames.indexOf(value);
      const newDate = new Date(displayMonth);
      newDate.setMonth(newMonth);
      goToMonth(newDate);
    },
    [displayMonth, monthNames, goToMonth]
  );

  const handleYearChange = React.useCallback(
    (value: string) => {
      const newYear = parseInt(value, 10);
      const newDate = new Date(displayMonth);
      newDate.setFullYear(newYear);
      goToMonth(newDate);
    },
    [displayMonth, goToMonth]
  );

  return (
    <div className="flex justify-center items-center gap-2">
      <Select
        value={monthNames[currentMonth]}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="p-1 border rounded text-sm font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {monthNames.map((name, index) => (
            <SelectItem key={index} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={currentYear.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="p-1 border rounded text-sm font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

type CalendarProps = React.ComponentPropsWithoutRef<typeof DayPicker> & {
  showCustomCaption?: boolean;
};

function Calendar({
  showCustomCaption = false,
  showOutsideDays = true,
  className,
  classNames,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
        Caption: showCustomCaption ? CustomCaption : undefined,
      }}
      {...props}
    />
  );
}

export { Calendar };

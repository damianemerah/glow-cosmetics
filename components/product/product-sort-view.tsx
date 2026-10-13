"use client";

import React from "react";
import { Grid, List, ArrowUpDown, Calendar, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
} from "@/constants/ui/index";
import { cn } from "@/lib/utils";

export type SortOption = "latest" | "price-asc" | "price-desc" | "popularity";

export type ViewMode = "grid" | "list";

interface ProductSortViewProps {
  onSortChange: (sort: SortOption) => void;
  onViewChange: (view: ViewMode) => void;
  currentSort: SortOption;
  currentView: ViewMode;
  productCount: number;
  displayCount: number;
  className?: string;
}

export default function ProductSortView({
  onSortChange,
  onViewChange,
  currentSort,
  currentView,
  productCount,
  displayCount,
  className = "",
}: ProductSortViewProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 py-3",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">{displayCount}</span> of{" "}
        {productCount} product{productCount !== 1 ? "s" : ""}
      </p>

      <div className="flex items-center gap-3">
        <Select
          value={currentSort}
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger className="h-9 w-[180px] rounded-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Latest
              </span>
            </SelectItem>
            <SelectItem value="price-asc">
              <span className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Price: Low to High
              </span>
            </SelectItem>
            <SelectItem value="price-desc">
              <span className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 rotate-180" />
                Price: High to Low
              </span>
            </SelectItem>
            <SelectItem value="popularity">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Popularity
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          className="hidden rounded-full border p-0.5 sm:flex"
          value={currentView}
          onValueChange={(value) => value && onViewChange(value as ViewMode)}
        >
          <ToggleGroupItem
            value="grid"
            aria-label="Grid view"
            className="h-8 rounded-full px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="List view"
            className="h-8 rounded-full px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

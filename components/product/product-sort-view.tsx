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
      className={`sm:flex  items-center justify-between sm:gap-4 py-3 ${className}`}
    >
      <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
        Showing {displayCount} of {productCount} result
        {productCount !== 1 ? "s" : ""}
      </div>

      <div className="flex items-center gap-4 justify-between">
        <Select
          value={currentSort}
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger className="w-[180px] h-9">
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
          value={currentView}
          onValueChange={(value) => value && onViewChange(value as ViewMode)}
        >
          <ToggleGroupItem
            value="grid"
            aria-label="Grid view"
            className="px-4 py-2"
          >
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="list"
            aria-label="List view"
            className="px-4 py-2"
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

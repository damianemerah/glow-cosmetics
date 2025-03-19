"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryOptions } from "@/constants/data";

interface ProductsFilterProps {
  search: string;
  category: string;
}

export default function ProductsFilter({
  search,
  category,
}: ProductsFilterProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(search);
  const [categoryFilter, setCategoryFilter] = useState(category);

  const handleFilter = (type: "search" | "category", val: string) => {
    // Get current URL and params
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    if (type === "search") {
      setSearchQuery(val);
      if (val) {
        params.set("search", val);
      } else {
        params.delete("search");
      }
    } else {
      setCategoryFilter(val);
      if (val !== "all") {
        params.set("category", val);
      } else {
        params.delete("category");
      }
    }

    const paramsString = params.toString();
    const newUrl = `/admin/products${paramsString ? `?${paramsString}` : ""}`;
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex flex-col md:flex-row w-full md:w-auto gap-2">
      <Input
        placeholder="Search products..."
        className="max-w-xs"
        value={searchQuery}
        onChange={(e) => handleFilter("search", e.target.value)}
      />
      <Select
        value={categoryFilter}
        onValueChange={(val) => handleFilter("category", val)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categoryOptions.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

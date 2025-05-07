"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Skeleton,
} from "@/constants/ui/index";
import { fetchCategoryById } from "@/actions/adminActions";
import type { Category } from "@/types/index";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    async function loadCategories() {
      setIsLoading(true);
      try {
        const result = await fetchCategoryById("parent-options");
        if (result.success && Array.isArray(result.categories)) {
          setCategories(result.categories);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

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

      {isLoading ? (
        <Skeleton className="h-10 w-[180px]" />
      ) : (
        <Select
          value={categoryFilter}
          onValueChange={(val) => handleFilter("category", val)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

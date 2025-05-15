"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, PanelTop, Loader2 } from "lucide-react";
import {
  Button,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/constants/ui/index";
import { useDebounce } from "@/hooks/useDebounce";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

type SearchResult = {
  id: string;
  name: string;
  item_type: "product" | "category";
};

interface SearchCommandProps {
  variant: "desktop" | "mobile";
}

export const SearchCommand = ({ variant }: SearchCommandProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async () => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false); // Ensure searching stops if query is too short
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc("search_items", {
        term: debouncedQuery.toLowerCase(),
        limit_count: 10,
      });

      if (error) {
        console.error("Search error:", error);
        setSearchResults([]); // Clear results on error
        return;
      }
      setSearchResults((data as SearchResult[]) || []);
    } catch (error) {
      console.error("Search RPC error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedQuery]); // Only depends on debouncedQuery

  useEffect(() => {
    performSearch();
  }, [performSearch]); // Effect runs when performSearch (and thus debouncedQuery) changes

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false); // Close popover on selection
    setSearchQuery(""); // Clear search input

    if (result.item_type === "product") {
      router.push(`/products/${result.id}`);
    } else if (result.item_type === "category") {
      router.push(`/products/${result.id}`);
    }
  };

  const products = searchResults.filter((i) => i.item_type === "product");
  const categories = searchResults.filter((i) => i.item_type === "category");

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          // flex flex-col items-center justify-center rounded-none h-full text-xs text-gray-500
          className={`flex ${variant === "desktop" ? "flex-row" : "flex-col text-xs text-gray-500 rounded-none h-full"} items-center justify-center font-montserrat`}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
          <span>Search</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`${variant === "desktop" ? "w-[300px] p-0" : "w-[90vw] max-w-[400px] p-0"}`}
        side="bottom"
        align={variant === "desktop" ? "end" : "center"}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Command is always rendered when PopoverContent is open */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search products & categories..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            autoFocus // Focus input when popover opens
          />
          {/* CommandList is always rendered, content changes based on state */}
          <CommandList>
            {isSearching && (
              <div className="p-4 py-6 text-center text-sm flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}
            {!isSearching &&
              debouncedQuery.length > 0 &&
              searchResults.length === 0 && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
            {!isSearching && searchResults.length > 0 && (
              <>
                {products.length > 0 && (
                  <CommandGroup heading="Products">
                    {products.map((r) => (
                      <CommandItem
                        key={r.id}
                        onSelect={() => handleSelect(r)}
                        value={r.name}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        <span>{r.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {categories.length > 0 && (
                  <CommandGroup heading="Categories">
                    {categories.map((r) => (
                      <CommandItem
                        key={r.id}
                        onSelect={() => handleSelect(r)}
                        value={r.name}
                      >
                        <PanelTop className="mr-2 h-4 w-4" />
                        <span>{r.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
            {/* Optional: Add hint if query is too short */}
            {!isSearching &&
              debouncedQuery.length > 0 &&
              debouncedQuery.length < 2 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Keep typing to search...
                </div>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

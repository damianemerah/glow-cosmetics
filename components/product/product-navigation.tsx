"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/constants/ui/index";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description?: string;
}

const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
        <Link href={href || "#"} ref={ref} className={cn(className)} {...props}>
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function ProductNavigation({
  categoryData = [],
}: {
  categoryData: Category[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [openCategory, setOpenCategory] = React.useState<string | null>(null);
  const A: Category[] = Array.isArray(categoryData) ? categoryData : [];

  const topLevelCategories = A.filter((cat) => cat.parent_id === null);
  const childCategoriesMap: Record<string, Category[]> = {};
  A.forEach((cat) => {
    if (cat.parent_id) {
      childCategoriesMap[cat.parent_id] =
        childCategoriesMap[cat.parent_id] || [];
      childCategoriesMap[cat.parent_id].push(cat);
    }
  });

  const isCategoryActive = (
    categorySlug: string,
    isParentCheck = false,
    parentSlugForChildCheck?: string
  ): boolean => {
    if (!pathname.startsWith("/products/c/")) return false;

    const pathSegments = pathname.substring("/products/c/".length).split("/");

    if (isParentCheck) {
      return pathSegments[0] === categorySlug;
    } else if (parentSlugForChildCheck) {
      return (
        pathSegments.length > 1 &&
        pathSegments[0] === parentSlugForChildCheck &&
        pathSegments[1] === categorySlug
      );
    } else {
      return pathSegments.length === 1 && pathSegments[0] === categorySlug;
    }
  };

  const isAllProductsActive =
    pathname === "/products" && searchParams.get("filter") === "all";

  return (
    <nav className="hidden sticky top-0 z-30 bg-background border-b border-border md:block">
      <div className="relative h-14">
        <div className="absolute inset-0  no-scrollbar">
          <div className="flex flex-nowrap gap-1 px-4 h-14 items-center">
            {/* All Products Link */}
            <Link
              href="/products?filter=all"
              className={cn(
                "shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                {
                  "bg-primary text-primary-foreground hover:bg-primary/90":
                    isAllProductsActive,
                }
              )}
            >
              All Products
            </Link>

            {/* Categories */}
            {topLevelCategories.map((parentCategory) => {
              const childItems = childCategoriesMap[parentCategory.id] || [];
              const isParentActive = isCategoryActive(
                parentCategory.slug,
                true
              );

              return (
                <div
                  key={parentCategory.id}
                  className="relative h-full flex items-center group"
                  onMouseEnter={() => setOpenCategory(parentCategory.id)}
                  onMouseLeave={() => setOpenCategory(null)}
                >
                  {childItems.length === 0 ? (
                    <Link
                      href={`/products/c/${parentCategory.slug}`}
                      className={cn(
                        "shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        {
                          "bg-primary text-primary-foreground hover:bg-primary/90":
                            isCategoryActive(parentCategory.slug),
                        }
                      )}
                    >
                      {parentCategory.name}
                    </Link>
                  ) : (
                    <>
                      <button
                        className={cn(
                          "shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                          "hover:bg-accent hover:text-accent-foreground",
                          {
                            "bg-primary text-primary-foreground hover:bg-primary/90":
                              isParentActive,
                          }
                        )}
                      >
                        {parentCategory.name}
                        <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                      </button>

                      {/* Dropdown Content */}
                      {openCategory === parentCategory.id && (
                        <div className="absolute left-0 top-full w-64 z-50 shadow-lg">
                          <div className="rounded-lg border bg-popover text-popover-foreground">
                            <div className="p-2 space-y-1">
                              <Link
                                href={`/products/c/${parentCategory.slug}`}
                                className={cn(
                                  "flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors",
                                  "hover:bg-accent hover:text-accent-foreground",
                                  {
                                    "bg-accent text-accent-foreground":
                                      pathname ===
                                      `/products/c/${parentCategory.slug}`,
                                  }
                                )}
                              >
                                All {parentCategory.name}
                              </Link>
                              {childItems.map((childCategory) => (
                                <Link
                                  key={childCategory.id}
                                  href={`/products/c/${parentCategory.slug}/${childCategory.slug}`}
                                  className={cn(
                                    "flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    {
                                      "bg-accent text-accent-foreground":
                                        isCategoryActive(
                                          childCategory.slug,
                                          false,
                                          parentCategory.slug
                                        ),
                                    }
                                  )}
                                >
                                  {childCategory.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

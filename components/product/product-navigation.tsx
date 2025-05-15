"use client";

import React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/constants/ui/index";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href || "#"}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md px-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default function ProductNavigation({
  categoryData: categories = [],
}: {
  categoryData: Category[];
}) {
  if (!Array.isArray(categories)) {
    console.warn(
      "ProductNavigation received non-array categoryData:",
      categories
    );
    categories = [];
  }

  const topLevel = categories.filter((cat) => cat.parent_id === null);
  const childrenMap: Record<string, Category[]> = {};
  categories.forEach((cat) => {
    if (cat.parent_id) {
      childrenMap[cat.parent_id] = childrenMap[cat.parent_id] || [];
      childrenMap[cat.parent_id].push(cat);
    }
  });

  const topLevelLinkClass =
    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50";

  return (
    <NavigationMenu
      delayDuration={100}
      className="max-w-full overflow-x-auto justify-start py-2"
    >
      <NavigationMenuList className="flex-nowrap gap-1">
        <NavigationMenuItem>
          <Link href="/products?filter=all" legacyBehavior passHref>
            <NavigationMenuLink className={topLevelLinkClass}>
              All Products
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {topLevel.map((parent) => {
          const children = childrenMap[parent.id] || [];

          if (children.length === 0) {
            return (
              <NavigationMenuItem key={parent.id}>
                <Link
                  href={`/products/c/${parent.slug}`}
                  legacyBehavior
                  passHref
                >
                  <NavigationMenuLink className={topLevelLinkClass}>
                    {parent.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={parent.id}>
              <NavigationMenuTrigger className={topLevelLinkClass}>
                {parent.name}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-3 p-4 md:w-[300px]">
                  <ListItem
                    href={`/products/c/${parent.slug}`}
                    title={`All ${parent.name}`}
                  >
                    Browse all items in this category.
                  </ListItem>

                  {children.map((child) => (
                    <ListItem
                      key={child.id}
                      href={`/products/c/${parent.slug}/${child.slug}`}
                      title={child.name}
                    ></ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

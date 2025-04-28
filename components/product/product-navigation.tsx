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
  navigationMenuTriggerStyle,
} from "@/constants/ui/index";
import { Category } from "@/types";

export default function ProductNavigation({
  categoryData: categories,
}: {
  categoryData: Category[];
}) {
  // Group children by parent_id
  const topLevel = categories.filter((cat) => cat.parent_id === null);
  const childrenMap: Record<string, Category[]> = {};
  categories.forEach((cat) => {
    if (cat.parent_id) {
      childrenMap[cat.parent_id] = childrenMap[cat.parent_id] || [];
      childrenMap[cat.parent_id].push(cat);
    }
  });

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* "All Products" top-level link */}
        <NavigationMenuItem>
          <Link href="/products" passHref legacyBehavior>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              All Products
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {topLevel.map((parent) => {
          const children = childrenMap[parent.id] || [];

          if (children.length === 0) {
            // Simple link
            return (
              <NavigationMenuItem key={parent.id}>
                <Link
                  href={`/products/c/${parent.slug}`}
                  passHref
                  legacyBehavior
                >
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {parent.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            );
          }

          // Dropdown menu for parent with children
          return (
            <NavigationMenuItem key={parent.id}>
              <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                {parent.name}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="flex flex-col">
                  {/* All {Parent} link */}
                  <NavigationMenuItem>
                    <Link
                      href={`/products/c/${parent.slug}`}
                      passHref
                      legacyBehavior
                    >
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                      >
                        All {parent.name}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  {children.map((child) => {
                    return (
                      <li key={child.id}>
                        <Link
                          href={`/products/c/${parent.slug}/${child.slug}`}
                          passHref
                          legacyBehavior
                        >
                          <NavigationMenuLink
                            className={navigationMenuTriggerStyle()}
                          >
                            {child.name}
                          </NavigationMenuLink>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Skeleton,
} from "@/constants/ui/index";
import { Slash } from "lucide-react";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface CategoryPath {
  name: string;
  slug: string;
  is_last: boolean; // matches the RPC column name
}

interface BreadcrumbsProps {
  categoryId: string;
  productName?: string;
}

export async function Breadcrumbs({
  categoryId,
  productName,
}: BreadcrumbsProps) {
  // 1. Two generics: Data = CategoryPath[] , Error = any
  const { data, error } = await supabaseAdmin.rpc("get_category_hierarchy", {
    cat_id: categoryId,
  });

  if (error) {
    console.error("Failed to load category hierarchy:", error);
    return null;
  }

  const paths = (data ?? []) as CategoryPath[];

  return (
    <Breadcrumb className="mb-4 text-sm text-muted-foreground">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/products">All Products</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {paths?.map(
          (
            category: CategoryPath // 2. annotate the callback param
          ) => (
            <React.Fragment key={category.slug}>
              <BreadcrumbSeparator>
                <Slash className="h-3 w-3" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {category.is_last && !productName ? (
                  <BreadcrumbPage className="font-medium text-foreground">
                    {category.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={`/products/c/${category.slug}`}>
                      {category.name}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        )}

        {productName && (
          <>
            <BreadcrumbSeparator>
              <Slash className="h-3 w-3" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground">
                {productName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export const BreadcrumSkeleton = () => {
  return (
    <nav className="mb-4 text-sm text-muted-foreground animate-pulse">
      <ul className="flex items-center space-x-2">
        <li>
          <Skeleton className="h-4 w-20 rounded-md" />
        </li>
        <li className="flex items-center space-x-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </li>
        <li className="flex items-center space-x-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-md" />
        </li>
      </ul>
    </nav>
  );
};

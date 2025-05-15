"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  Button,
  SheetDescription,
} from "@/constants/ui/index";
import { Menu, Grid3X3, ShoppingBag, Sparkles } from "lucide-react";
import { fetchProductCategories } from "@/lib/swr/categories";
import type { ProdCategory, ServiceItem, UnifiedCategory } from "@/types";
import { services as staticServices } from "@/constants/data";
import { SocialIcons } from "@/components/navbar/SocialIcons";

interface CategoryListProps {
  onLinkClick?: () => void;
  buttonStyle?: "default" | "mobile-nav";
}

const buildProductCategoryTree = (
  categories: ProdCategory[]
): UnifiedCategory[] => {
  const categoryMap = new Map<string, UnifiedCategory>();
  const rootCategories: UnifiedCategory[] = [];

  categories.forEach((cat) => {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      type: "product",
      pinned: cat.pinned,
      children: [],
    });
  });

  categories.forEach((cat) => {
    const unifiedCat = categoryMap.get(cat.id)!;
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      const parentUnifiedCat = categoryMap.get(cat.parent_id)!;
      parentUnifiedCat.children?.push(unifiedCat);
      unifiedCat.parent_slug = parentUnifiedCat.slug;
    } else {
      rootCategories.push(unifiedCat);
    }
  });
  return rootCategories;
};

// Helper to group services by their 'category' property
const groupServices = (services: ServiceItem[]): UnifiedCategory[] => {
  const serviceGroupMap = new Map<string, UnifiedCategory>();

  services.forEach((service) => {
    const groupName = service.category || "Other Services";
    if (!serviceGroupMap.has(groupName)) {
      serviceGroupMap.set(groupName, {
        id: `service-group-${groupName.toLowerCase().replace(/\s+/g, "-")}`,
        name: groupName,
        slug: groupName.toLowerCase().replace(/\s+/g, "-"),
        type: "service",
        children: [],
      });
    }
    serviceGroupMap.get(groupName)!.children?.push({
      id: service.id,
      name: service.name,
      slug: service.slug,
      type: "service",
    });
  });
  return Array.from(serviceGroupMap.values());
};

export const CategoryList = ({
  onLinkClick,
  buttonStyle = "default",
}: CategoryListProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: productCategoriesData,
    error: productCategoriesError,
    isLoading: isLoadingProductCategories,
  } = useSWR<ProdCategory[]>(
    isOpen ? "productCategories" : null,
    fetchProductCategories,
    {
      revalidateOnFocus: false,
    }
  );

  const { allProductCategories, featuredProductCategories, serviceCategories } =
    useMemo(() => {
      const processedProductCategories = productCategoriesData
        ? buildProductCategoryTree(productCategoriesData)
        : [];
      const featured = processedProductCategories.filter((c) => c.pinned);

      const groupedServiceItems = groupServices(staticServices);

      return {
        allProductCategories: processedProductCategories,
        featuredProductCategories:
          featured.length > 0
            ? featured
            : processedProductCategories.slice(0, 4),
        serviceCategories: groupedServiceItems,
      };
    }, [productCategoriesData]);

  const isLoading = isLoadingProductCategories;

  const closeSheet = () => {
    setIsOpen(false);
    onLinkClick?.();
  };

  const renderTriggerButton = () => {
    if (buttonStyle === "mobile-nav") {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center justify-center rounded-none h-full text-xs text-gray-500 w-full"
          aria-label="Open categories menu"
        >
          <Grid3X3 className="h-5 w-5 mb-1" />
          <span>Categories</span>
        </Button>
      );
    }
    return (
      <Button variant="ghost" size="icon" aria-label="Open categories menu">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Categories</span>
      </Button>
    );
  };

  const renderCategoryLink = (
    category: UnifiedCategory,
    isSubCategory = false,
    parentProductSlug?: string
  ) => {
    const baseProductPath = "/products/c";
    const baseServicePath = "/services";

    let href = "";
    if (category.type === "product") {
      if (isSubCategory && parentProductSlug) {
        href = `${baseProductPath}/${parentProductSlug}/${category.slug}`;
      } else {
        href = `${baseProductPath}/${category.slug}`;
      }
    } else {
      href = `${baseServicePath}/${category.slug}`;
    }

    return (
      <Link
        key={category.id}
        href={href}
        className={`block px-4 py-3 hover:bg-muted transition-colors rounded-md ${isSubCategory ? "text-sm pl-8" : "font-medium"}`}
        onClick={closeSheet}
      >
        {category.name}
      </Link>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{renderTriggerButton()}</SheetTrigger>
      <SheetContent
        side="left"
        className="sm:max-w-sm md:max-w-md p-0 flex flex-col"
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-lg sm:text-xl font-semibold">
            Explore
          </SheetTitle>
          <SheetDescription className="sr-only">
            Mobile Navigation
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto flex-grow pb-4">
          {isLoading && (
            <div className="p-6 flex justify-center items-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              <p className="ml-3 text-muted-foreground">
                Loading Categories...
              </p>
            </div>
          )}
          {productCategoriesError && (
            <div className="p-6 text-center text-destructive">
              <p>Could not load product categories.</p>
              <p className="text-sm">{productCategoriesError.message}</p>
            </div>
          )}

          {!isLoading && !productCategoriesError && (
            <>
              {/* Featured Product Categories Section */}
              {featuredProductCategories.length > 0 && (
                <div className="p-4">
                  <h3 className="font-semibold text-md mb-3 text-muted-foreground tracking-wide">
                    Featured Products
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {featuredProductCategories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/products/c/${category.slug}`}
                        className="bg-secondary/50 rounded-lg p-3 hover:bg-secondary transition-colors flex flex-col items-center justify-center text-center text-sm"
                        onClick={closeSheet}
                      >
                        {/* Icon can be based on category.images or a default one */}
                        <ShoppingBag className="h-6 w-6 mb-1 text-primary" />
                        <span className="font-medium">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Section */}
              {serviceCategories.length > 0 && (
                <div className="p-4 border-t mt-4 ">
                  <h3 className="font-semibold text-md mb-2 text-muted-foreground tracking-wide">
                    Our Services
                  </h3>
                  {serviceCategories.map((serviceGroup) => (
                    <div key={serviceGroup.id} className="mb-3">
                      <h4 className="font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-md text-sm mb-2 flex items-center">
                        <Sparkles className="h-4 w-4 mr-2" />
                        {serviceGroup.name}
                      </h4>
                      {serviceGroup.children?.map((service) =>
                        renderCategoryLink(service)
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* All Product Categories Section */}
              {allProductCategories.length > 0 && (
                <div className="p-4 border-y mt-4">
                  <h3 className="font-semibold text-md mb-2 text-muted-foreground tracking-wide">
                    All Product Categories
                  </h3>
                  {allProductCategories.map((category) => (
                    <div key={category.id} className="mb-1">
                      {renderCategoryLink(category)}
                      {category.children && category.children.length > 0 && (
                        <div className="pl-4 border-l-2 border-muted ml-2">
                          {category.children.map((child) =>
                            renderCategoryLink(child, true, category.slug)
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <SocialIcons className="p-4 border-t mb-16 flex items-center justify-center" />

              {!productCategoriesData?.length &&
                !staticServices.length &&
                !isLoading && (
                  <p className="p-6 text-center text-muted-foreground">
                    No categories available at the moment.
                  </p>
                )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

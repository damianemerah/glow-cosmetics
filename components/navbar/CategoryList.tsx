"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  Button,
  SheetDescription,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/constants/ui/index";
import { Menu, Grid3X3, Sparkles } from "lucide-react";
import type { Category, ServiceItem, UnifiedCategory } from "@/types";
import { services as staticServices } from "@/constants/data";
import { SocialIcons } from "@/components/navbar/SocialIcons";
// import { useScrollStore } from "@/store/scrollStore";

interface CategoryListProps {
  onLinkClick?: () => void;
  buttonStyle?: "default" | "mobile-nav";
  initialCategories?: Category[];
}

const buildProductCategoryTree = (
  categories: Category[]
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
  initialCategories = [],
}: CategoryListProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { productCategoriesGrouped, serviceCategories } = useMemo(() => {
    const productCategories =
      initialCategories.length > 0
        ? buildProductCategoryTree(initialCategories)
        : [];

    const beautyProducts: UnifiedCategory = {
      id: "group-beauty-products",
      name: "Beauty Products",
      slug: "beauty-products",
      type: "product-group",
      children: [],
    };

    const jewellery: UnifiedCategory = {
      id: "group-jewellery",
      name: "Jewellery",
      slug: "jewellery",
      type: "product-group",
      children: [],
    };

    productCategories.forEach((cat) => {
      if (cat.slug === "jewellers") {
        jewellery.children?.push(cat);
      } else {
        beautyProducts.children?.push(cat);
      }
    });

    const groupedServices = groupServices(staticServices);

    return {
      productCategoriesGrouped: [beautyProducts, jewellery].filter(
        (group) => group.children && group.children.length > 0
      ),
      serviceCategories: groupedServices,
    };
  }, [initialCategories]);

  const isLoading = false;

  const closeSheet = () => {
    setIsOpen(false);
    onLinkClick?.();
  };

  const renderTriggerButton = () => {
    if (buttonStyle === "mobile-nav") {
      return (
        <div
          className="font-montserrat flex flex-col items-center justify-center rounded-none h-full text-xs text-gray-500 w-full"
          aria-label="Open categories menu"
        >
          <Grid3X3 className="h-7 w-7 mb-1" />
          <span className="font-montserrat">Categories</span>
        </div>
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
    pad: boolean,
    category: UnifiedCategory,
    isSubCategory = false,
    parentProductSlug?: string
  ) => {
    const baseProductPath = "/products/c";

    let href = "";
    if (category.type === "product") {
      if (isSubCategory && parentProductSlug) {
        href = `${baseProductPath}/${parentProductSlug}/${category.slug}`;
      } else {
        href = `${baseProductPath}/${category.slug}`;
      }
    } else if (category.type === "service") {
      // Services now link to the main services page with an ID
      href = `/services?service=${category.slug}`;
    } else {
      // For product-groups like 'Beauty Products' or 'Jewellery', link to a general products page or first child
      href = "/products";
    }

    return (
      <Link
        key={category.id}
        href={href}
        className={`block py-3 hover:bg-muted transition-colors rounded-md ${isSubCategory ? "text-sm pl-8" : "font-medium"} ${pad ? "px-4" : ""}`}
        onClick={() => {
          // if (category.type === "service") {
          //   clearServicesScrollId();
          //   setServicesScrollId(category.id);
          // }
          closeSheet();
        }}
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

          {!isLoading && (
            <>
              {/* Grouped Product Categories Section */}
              {productCategoriesGrouped.length > 0 && (
                <div className="p-4">
                  <Accordion type="multiple" className="w-full">
                    {productCategoriesGrouped.map((group) => (
                      <AccordionItem key={group.id} value={group.id}>
                        <AccordionTrigger className="font-semibold text-md text-primary flex items-center py-4">
                          <div className="flex items-center">
                            <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
                            <span>{group.name}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <Accordion type="multiple" className="w-full pl-4">
                            {group.children?.map((category) =>
                              category.children &&
                              category.children.length > 0 ? (
                                <AccordionItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  <AccordionTrigger className="font-medium text-sm py-3">
                                    {category.name}
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="pl-4 border-l-2 border-muted ml-2">
                                      {category.children.map((child) =>
                                        renderCategoryLink(
                                          true,
                                          child,
                                          true,
                                          category.slug
                                        )
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ) : (
                                renderCategoryLink(false, category) // Render as a link if no children
                              )
                            )}
                          </Accordion>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Services Section */}
              {serviceCategories.length > 0 && (
                <div className="p-4 border-t mt-4 ">
                  <h3 className="font-medium text-primary-foreground bg-primary px-3 py-1.5 rounded-md mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Our Services
                  </h3>
                  {serviceCategories.map((serviceGroup) =>
                    serviceGroup.children?.map((service) =>
                      renderCategoryLink(true, service)
                    )
                  )}
                </div>
              )}
              <SocialIcons className="p-4 border-t mb-16 flex items-center justify-center" />

              {!initialCategories.length &&
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

import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DataTable from "@/components/admin/data-table";
import PageHeader from "@/components/admin/page-header";
import ProductsFilter from "./products-filter";
import { deleteProduct, fetchProducts } from "@/actions/adminActions";
import { Loader2 } from "lucide-react";
import type { Product, ProductCategory } from "@/types/dashboard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Format price helper function
function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

// Create a delete action function with 'use server' directive
async function handleDeleteProduct(id: string) {
  "use server";
  if (confirm("Are you sure you want to delete this product?")) {
    await deleteProduct(id);
  }
}

// Product columns definition
const productColumns = [
  { key: "name", title: "Name" },
  {
    key: "price",
    title: "Price",
    render: (row: Product) => formatPrice(row.price),
  },
  {
    key: "stock",
    title: "Stock",
    render: (row: Product) => (
      <div className="flex items-center gap-2">
        <span>{row.stock_quantity}</span>
        {row.stock_quantity === 0 ? (
          <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
        ) : row.stock_quantity < 10 ? (
          <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
        ) : null}
      </div>
    ),
  },
  {
    key: "category",
    title: "Category",
    render: (row: Product) => {
      const categoryLabels: Record<ProductCategory, string> = {
        lip_gloss: "Lip Gloss",
        skin_care: "Skin Care",
        supplements: "Supplements",
        jewellery: "Jewellery",
        makeup: "Makeup",
      };
      return (
        categoryLabels[row.category as keyof typeof categoryLabels] ||
        row.category
      );
    },
  },
  {
    key: "status",
    title: "Status",
    render: (row: Product) => (
      <Badge
        className={
          row.is_active
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }
      >
        {row.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    key: "actions",
    title: "Actions",
    render: (row: Product) => (
      <div className="flex gap-2">
        <Link href={`/admin/products/${row.id}`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
        <form action={handleDeleteProduct.bind(null, row.id)}>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500"
            type="submit"
          >
            Delete
          </Button>
        </form>
      </div>
    ),
  },
];

async function ProductsTable({
  search,
  category,
  page = 1,
}: {
  search: string;
  category: string;
  page?: number;
}) {
  const { products, totalPages } = await fetchProducts(page);

  // Filter products based on search and category
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = search
      ? product.name.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <DataTable
        columns={productColumns}
        data={filteredProducts}
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">No products found</p>
            <Link href="/admin/products/new" className="mt-4 inline-block">
              <Button>Add Your First Product</Button>
            </Link>
          </div>
        }
      />
      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/admin/products?page=${Math.max(
                  1,
                  page - 1
                )}&search=${search}&category=${category}`}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`/admin/products?page=${pageNum}&search=${search}&category=${category}`}
                    isActive={pageNum === page}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href={`/admin/products?page=${Math.min(
                  totalPages,
                  page + 1
                )}&search=${search}&category=${category}`}
                className={
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { search = "", category = "all", page = "1" } = await searchParams;
  const currentPage = parseInt(page as string) || 1;

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product inventory"
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <ProductsFilter search={search} category={category} />
        <Link href="/admin/products/new">
          <Button className="bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform">
            Add Product
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ProductsTable search={search} category={category} page={currentPage} />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/page-header";
import ProductsFilter from "./products-filter";
import { fetchProducts } from "@/actions/adminActions";
import { Loader2 } from "lucide-react";
import { Button } from "@/constants/ui/index";
import ProductList from "@/components/product/product-list";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const {
    search = "",
    category = "all",
    page = "1",
    sortBy = "created_at",
    sortDir = "desc",
  } = (await searchParams) || {};
  const currentPage = parseInt(page, 10);
  const validatedPage =
    !isNaN(currentPage) && currentPage > 0 ? currentPage : 1;
  const validatedSortDir = sortDir === "asc" ? "asc" : "desc";

  const result = await fetchProducts(
    validatedPage,
    search,
    category,
    sortBy,
    validatedSortDir
  );

  const products = result.success ? result.products || [] : [];
  const totalPages = result.success ? result.totalPages || 1 : 1;

  if (!result.success) {
    console.error("Error fetching products:", result.error);
    // You could display an error message here
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <PageHeader
        title="Products"
        description="Manage your product inventory"
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <ProductsFilter search={search} category={category} />
        <Link href="/admin/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>
      <Suspense
        key={validatedPage + search + category}
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Loading products...
            </span>
          </div>
        }
      >
        <ProductList
          products={products}
          totalPages={totalPages}
          currentPage={validatedPage}
          search={search}
          category={category}
          sortBy={sortBy}
          sortDir={validatedSortDir}
        />
      </Suspense>
    </div>
  );
}

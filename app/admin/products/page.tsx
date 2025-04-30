import { Suspense } from "react";
import Link from "next/link";
import PageHeader from "@/components/admin/page-header"; // Adjust path if needed
import ProductsFilter from "./products-filter"; // Keep filter component
import { fetchProducts } from "@/actions/adminActions"; // Fetch action
import { Loader2 } from "lucide-react";
import { Button } from "@/constants/ui/index";
import ProductList from "@/components/product/product-list"; // Import the new Client Component

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const {
    search = "",
    category = "all",
    page = "1",
  } = (await searchParams) || {};
  const currentPage = parseInt(page, 10);
  const validatedPage =
    !isNaN(currentPage) && currentPage > 0 ? currentPage : 1;

  // Fetch initial data here on the server
  // Note: fetchProducts now needs to handle filtering server-side if possible
  // Or pass all products and let the client filter (less efficient for large datasets)
  // Assuming fetchProducts can handle pagination at least
  const { products, totalPages } = await fetchProducts(
    validatedPage,
    search,
    category
  ); // Pass filters to fetch

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      {" "}
      {/* Added container */}
      <PageHeader
        title="Products"
        description="Manage your product inventory"
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {/* Keep the filter component if it's separate */}
        <ProductsFilter search={search} category={category} />
        <Link href="/admin/products/new">
          <Button>
            {" "}
            {/* Removed custom styling, rely on default Button style */}
            Add Product
          </Button>
        </Link>
      </div>
      <Suspense
        key={validatedPage + search + category} // Add key to force re-render on param change if needed
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Loading products...
            </span>
          </div>
        }
      >
        {/* Render the Client Component with fetched data */}
        <ProductList
          products={products}
          totalPages={totalPages}
          currentPage={validatedPage}
          search={search}
          category={category}
        />
      </Suspense>
    </div>
  );
}

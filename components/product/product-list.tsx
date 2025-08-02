"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image component
import { useRouter } from "next/navigation"; // Use for refresh
import { toast } from "sonner";
import { deleteProduct } from "@/actions/adminActions"; // Import Server Action
import type { Product, ProductWithCategories } from "@/types/index";
import DataTable from "@/components/admin/data-table"; // Adjust path if needed
import { Badge, Button } from "@/constants/ui/index"; // Import AspectRatio
import { ArrowUpDown, Loader2 } from "lucide-react";
import { formatZAR } from "@/utils";
import ConfirmDialog from "@/components/common/confirm-dialog";
import Pagination from "@/components/common/pagination";

// Format price helper function (can be moved to a utils file)
function formatPrice(price: number | null | undefined): string {
  if (price == null) return "$0.00"; // Handle null/undefined price
  return formatZAR(price);
}

// Props for the client component
interface ProductListProps {
  products: ProductWithCategories[];
  totalPages: number;
  currentPage: number;
  search: string;
  category: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

interface ProductColumn {
  key: string;
  title: string;
  sortable?: boolean;
  render?: (row: ProductWithCategories) => React.ReactNode;
  header?: () => React.ReactNode;
}

export default function ProductList({
  products,
  totalPages,
  currentPage,
  search,
  category,
  sortBy = "created_at",
  sortDir = "desc",
}: ProductListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const generateSortUrl = (field: string) => {
    const newSortDir =
      sortBy === field ? (sortDir === "asc" ? "desc" : "asc") : "asc";
    const params = new URLSearchParams({
      page: currentPage.toString(),
      search,
      category,
      sortBy: field,
      sortDir: newSortDir,
    });
    return `/admin/products?${params.toString()}`;
  };

  // --- Delete Handler ---
  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;

    startTransition(async () => {
      const result = await deleteProduct(productToDelete.id);
      if (result.success) {
        toast.success(
          `Product "${productToDelete.name}" deleted successfully.`
        );
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
        router.refresh();
      } else {
        toast.warning(`Failed to delete product: ${result.error}`);
        // Keep dialog open on error? Optional.
        // setIsDeleteDialogOpen(false);
        // setProductToDelete(null);
      }
    });
  };

  // --- Columns Definition (specific to this client component) ---
  const productColumns: ProductColumn[] = [
    {
      key: "image",
      title: "Image",
      render: (row: Product) => (
        <div className="relative h-14 w-14 overflow-hidden rounded-md bg-muted">
          <Image
            src={row.image_url?.[0] || "/images/placeholder.png"}
            alt={row.name}
            fill
            className="object-contain"
          />
        </div>
      ),
    },
    { key: "name", title: "Name" },
    {
      key: "price",
      title: "Price",
      sortable: true,
      render: (row: Product) => formatPrice(row.price),
      header: () => (
        <Link
          href={generateSortUrl("price")}
          className="flex items-center hover:underline"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
          {sortBy === "price" && (
            <span className="ml-1 text-xs">
              ({sortDir === "asc" ? "↑" : "↓"})
            </span>
          )}
        </Link>
      ),
    },
    {
      key: "stock",
      title: "Stock",
      sortable: true,
      render: (row: Product) => (
        <div className="flex items-center gap-2">
          <span>{row.stock_quantity ?? 0}</span> {/* Handle nullish stock */}
          {(row.stock_quantity ?? 0) === 0 ? (
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              Out of Stock
            </Badge>
          ) : (row.stock_quantity ?? 0) < 10 ? (
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              Low Stock
            </Badge>
          ) : null}
        </div>
      ),
      header: () => (
        <Link
          href={generateSortUrl("stock_quantity")}
          className="flex items-center hover:underline"
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
          {sortBy === "stock_quantity" && (
            <span className="ml-1 text-xs">
              ({sortDir === "asc" ? "↑" : "↓"})
            </span>
          )}
        </Link>
      ),
    },
    {
      key: "category",
      title: "Category",
      render: (row: ProductWithCategories) => {
        // Ensure product_categories and categories exist before mapping
        return (
          row.product_categories
            ?.map((cat) => cat?.categories?.name)
            .filter(Boolean) // Remove any null/undefined names
            .join(", ") || "N/A"
        );
      },
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (row: ProductWithCategories) => (
        <Badge
          variant={row.is_active ? "default" : "outline"}
          className={
            row.is_active
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {row.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
      header: () => (
        <Link
          href={generateSortUrl("is_active")}
          className="flex items-center hover:underline"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
          {sortBy === "is_active" && (
            <span className="ml-1 text-xs">
              ({sortDir === "asc" ? "↑ Inactive First" : "↓ Active First"})
            </span>
          )}
        </Link>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (row: Product) => (
        <div className="flex gap-2">
          <Link href={`/admin/products/${row.id}`} legacyBehavior passHref>
            <Button asChild variant="outline" size="sm">
              <a>Edit</a>
            </Button>
          </Link>
          {/* Button to trigger the delete dialog */}
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => handleDelete(row)} // Pass the whole row or just id
            disabled={isPending && productToDelete?.id === row.id} // Disable button for the specific product being deleted
          >
            {isPending && productToDelete?.id === row.id ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* --- Data Table --- */}
      <DataTable
        columns={productColumns}
        data={products}
        allowToggleView={true}
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">No products found</p>
            <Link href="/admin/products/new" className="mt-4 inline-block">
              <Button>Add Your First Product</Button>
            </Link>
          </div>
        }
      />

      {/* --- Pagination --- */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/admin/products"
          searchParams={{
            search,
            category,
            sortBy,
            sortDir,
          }}
          className="mt-6"
        />
      )}

      {/* --- Use ConfirmDialog component instead of the inline AlertDialog --- */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete the product "${productToDelete?.name || "this product"}" and all associated data.`}
        confirmText="Yes, delete product"
        confirmVariant="destructive"
        isLoading={isPending}
      />
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Use for refresh
import { toast } from "sonner";
import { deleteProduct } from "@/actions/adminActions"; // Import Server Action
import type { Product, ProductWithCategories } from "@/types/index";
import DataTable from "@/components/admin/data-table"; // Adjust path if needed
import {
  Badge,
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/constants/ui/index";
import { Loader2 } from "lucide-react";
import { formatZAR } from "@/utils";
import ConfirmDialog from "@/components/common/confirm-dialog";

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
}

export default function ProductList({
  products,
  totalPages,
  currentPage,
  search,
  category,
}: ProductListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

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
      render: (row: Product) => (
        <Badge
          variant={row.is_active ? "default" : "outline"} // Use variants for better styling
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
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/admin/products?page=${Math.max(
                  1,
                  currentPage - 1
                )}&search=${search}&category=${category}`}
                aria-disabled={currentPage <= 1}
                tabIndex={currentPage <= 1 ? -1 : undefined}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {/* Consider adding ellipsis logic for many pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href={`/admin/products?page=${pageNum}&search=${search}&category=${category}`}
                    isActive={pageNum === currentPage}
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
                  currentPage + 1
                )}&search=${search}&category=${category}`}
                aria-disabled={currentPage >= totalPages}
                tabIndex={currentPage >= totalPages ? -1 : undefined}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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

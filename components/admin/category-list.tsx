"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DataTable from "@/components/admin/data-table";
import { Badge, Button } from "@/constants/ui/index";
import { Loader2 } from "lucide-react";
import type { Category } from "@/types/index";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/confirm-dialog";
import Image from "next/image"; // Import Image component

// Create a deleteCategory function if it doesn't exist
import { deleteCategory } from "@/actions/adminActions";

interface CategoryListProps {
  categories: Category[];
  productsCount: Record<string, number>;
}

export default function CategoryList({
  categories,
  productsCount,
}: CategoryListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  // Delete handler
  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;

    // Check if category has products
    const productCount = productsCount[categoryToDelete.id] || 0;
    if (productCount > 0) {
      toast.warning(
        `Cannot delete category "${categoryToDelete.name}" because it has ${productCount} products associated with it. Please remove the products first.`
      );
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteCategory(categoryToDelete.id);
        if (result.success) {
          toast.success(
            `Category "${categoryToDelete.name}" deleted successfully`
          );
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
          router.refresh();
        } else {
          toast.warning(`Failed to delete category: ${result.error}`);
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.warning("An error occurred while deleting the category");
      }
    });
  };

  // Category columns definition
  const categoryColumns = [
    {
      key: "image",
      title: "Image",
      render: (row: Category) => {
        if (!row.images || row.images.length === 0) return null;
        return (
          <div className="relative h-14 w-14 overflow-hidden rounded-md bg-muted">
            <Image
              src={row.images[0]}
              alt={row.name}
              fill
              className="object-contain"
            />
          </div>
        );
      },
    },
    { key: "name", title: "Name" },
    {
      key: "slug",
      title: "Slug",
      render: (row: Category) => row.name.toLowerCase().replace(/\s+/g, "-"),
    },
    {
      key: "productCount",
      title: "Products",
      render: (row: Category) => (
        <Badge variant="outline" className="font-normal">
          {productsCount[row.id] || 0}
        </Badge>
      ),
    },
    {
      key: "parent",
      title: "Parent Category",
      render: (row: Category) => {
        if (!row.parent_id) return "None";
        const parent = categories.find((c) => c.id === row.parent_id);
        return parent ? parent.name : "Unknown";
      },
    },
    {
      key: "actions",
      title: "Actions",
      render: (row: Category) => (
        <div className="flex gap-2">
          <Link href={`/admin/categories/${row.id}`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => handleDelete(row)}
            disabled={isPending && categoryToDelete?.id === row.id}
          >
            {isPending && categoryToDelete?.id === row.id ? (
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
    <div>
      <DataTable
        columns={categoryColumns}
        data={categories}
        allowToggleView={true} // Enable view toggling
        emptyState={
          <div className="text-center py-8">
            <p className="text-muted-foreground">No categories found</p>
            <Link href="/admin/categories/new" className="mt-4 inline-block">
              <Button>Add Your First Category</Button>
            </Link>
          </div>
        }
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Category"
        description={
          categoryToDelete
            ? `Are you sure you want to delete the category "${categoryToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this category? This action cannot be undone."
        }
        confirmText="Yes, delete category"
        confirmVariant="destructive"
        isLoading={isPending}
      />
    </div>
  );
}

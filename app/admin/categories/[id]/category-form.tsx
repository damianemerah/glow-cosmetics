"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Input,
  Card,
  CardContent,
  Checkbox,
  Label,
  Skeleton,
} from "@/constants/ui/index";
import { toast } from "sonner";
import { ArrowLeft, X, ImageIcon, Loader2, RefreshCw } from "lucide-react"; // Added RefreshCw icon
import Image from "next/image";
import { saveCategory, uploadImageToSupabase } from "@/actions/adminActions";
import type { Category } from "@/types/index";
import useSWR from "swr";

// Define the schema for form validation
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  parent_id: z.string().nullable(),
  pinned: z.boolean().default(true),
  images: z.array(z.string().url("Must be a valid URL")).default([]),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoryForm({
  id,
  initialData,
  categoryData,
}: {
  id: string;
  initialData: CategoryFormData | null;
  categoryData?: Category[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(true);

  // Ensure parentCategories is always an array
  const [parentCategories] = useState<Category[]>(categoryData || []);

  // Use SWR for category data - Corrected Key
  const { data: category, mutate } = useSWR<CategoryFormData | null>(
    id === "new" ? null : `category-${id}`,
    null,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  );

  // --- safeUpdateCache Implementation ---
  const safeUpdateCache = useCallback(
    (newData: Partial<CategoryFormData>) => {
      if (id === "new") return; // Don't cache for new items yet

      // Merge newData with existing data or defaults from schema
      const completeData: CategoryFormData = {
        name: newData.name ?? category?.name ?? "",
        // Ensure parent_id explicitly handles undefined vs null
        parent_id:
          newData.parent_id !== undefined
            ? newData.parent_id
            : (category?.parent_id ?? null),
        pinned: newData.pinned ?? category?.pinned ?? true,
        images: newData.images ?? category?.images ?? [],
      };

      // Mutate SWR cache without revalidation
      mutate(completeData, false);
    },
    [mutate, category, id] // Dependencies
  );
  // --- End of safeUpdateCache ---

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }, // Added dirtyFields
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    // Use SWR data if available, otherwise initialData, then defaults
    defaultValues: category ??
      initialData ?? {
        name: "",
        parent_id: null,
        pinned: true,
        images: [],
      },
  });

  // Watch images for the UI - ensure it's always an array
  const currentImages = watch("images") || [];

  const clearForm = () => {
    // Reset to initial data for edits, or empty for new
    if (id === "new") {
      reset({
        name: "",
        parent_id: null,
        pinned: true,
        images: [],
      });
      toast.info("Form cleared");
    } else {
      // For existing categories, reset to the original data
      reset(
        initialData || {
          name: "",
          parent_id: null,
          pinned: true,
          images: [],
        }
      );
      toast.info("Form reset to original values");
      router.replace("/admin/categories/new");
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);

    try {
      if (data.pinned && !data.images.length) {
        toast.warning(
          "Please upload at least one image for pinned categories."
        );
        return;
      }
      const result = await saveCategory(data, id);

      if (result.success) {
        if (id !== "new") {
          safeUpdateCache(data);
        }

        toast.success(
          `Category ${id === "new" ? "created" : "updated"} successfully`
        );

        // Only redirect if shouldRedirect is true
        if (shouldRedirect) {
          router.push("/admin/categories");
        } else {
          // If we don't redirect, reset the form and mark as clean
          if (id === "new") {
            reset({
              name: "",
              parent_id: null,
              pinned: true,
              images: [],
            });
          } else {
            // For edits, update the initialData
            reset(data, { keepValues: true });
          }
        }
      } else {
        toast.warning(`Failed to save category: ${result.error}`);
      }
    } catch (error) {
      const err = error as Error;
      toast.warning(`Failed to save category: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "category-images");
      formData.append("title", watch("name") || "Category Image");
      const imageUrl = await uploadImageToSupabase(formData);

      if (imageUrl) {
        const newImages = [...currentImages, imageUrl];
        setValue("images", newImages, {
          shouldDirty: true,
        });

        if (id !== "new") {
          safeUpdateCache({ images: newImages });
        }

        toast.success("Image uploaded successfully");
      } else {
        toast.warning("Failed to upload image");
      }
    } catch (error) {
      toast.warning("Error uploading image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    // Update react-hook-form state
    setValue("images", newImages, { shouldDirty: true });

    // Update SWR cache optimistically if editing an existing category
    if (id !== "new") {
      safeUpdateCache({ images: newImages });
    }
  };

  // Improved Loading State Logic
  if (id !== "new" && !category && !initialData) {
    // If it's an edit, but we don't have data yet (e.g., SWR hasn't resolved fallback)
    // You might want a more specific check if SWR is actively fetching
    return (
      <div className="min-h-screen bg-gray-50 sm:py-6">
        <Card className="max-w-3xl mx-auto sm:shadow-md border-none sm:border">
          <CardContent className="pt-6 p-0 sm:p-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-10 w-64 mb-6" />
            <div className="space-y-6 mb-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 sm:py-6">
      <Card className="max-w-3xl mx-auto sm:shadow-md border-none sm:border">
        <CardContent className="pt-6 p-0 sm:p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {id === "new" ? "Create New Category" : "Edit Category"}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6 mb-6">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category Name*
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="name" className="w-full" />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Parent Category Select */}
              <div>
                <label
                  htmlFor="parent_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Parent Category
                </label>
                <Controller
                  name="parent_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) =>
                        field.onChange(val === "none" ? null : val)
                      }
                      value={field.value ?? "none"}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select parent category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                        {parentCategories
                          .filter((cat) => cat.id !== id)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="pinned"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="pinned"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Pin (Show in homepage)
                </Label>
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Images
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                  {currentImages.map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className="h-full w-full border rounded-md overflow-hidden relative bg-gray-100">
                        <Image
                          src={url}
                          alt={`Category image ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" // Provide sizes hint
                          className="object-cover"
                          priority={index < 2} // Prioritize loading first few images
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          aria-label={`Remove image ${index + 1}`}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Image upload button */}
                  <div className="aspect-square">
                    <label
                      htmlFor="image-upload"
                      className={`h-full w-full border border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center text-center">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          <p className="text-xs text-gray-500 mt-2 px-1">
                            Uploading...
                          </p>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                          <p className="text-xs text-gray-500 mt-2">
                            Add Image
                          </p>
                        </>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          const categoryName = watch("name");

                          if (!categoryName || categoryName.trim() === "") {
                            toast.warning(
                              "Please enter a category name before uploading an image."
                            );
                            e.target.value = "";
                            return;
                          }

                          if (file) {
                            handleImageUpload(file);
                          }
                          e.target.value = "";
                        }}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
                {errors.images && (
                  <p className="text-sm text-red-500 mt-1">
                    {/* You might need a specific message if array validation fails */}
                    {typeof errors.images.message === "string"
                      ? errors.images.message
                      : "Invalid image URL detected."}
                  </p>
                )}
              </div>

              {/* Redirect Option */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shouldRedirect"
                  checked={shouldRedirect}
                  onCheckedChange={(checked) => setShouldRedirect(!!checked)}
                />
                <Label htmlFor="shouldRedirect" className="cursor-pointer">
                  Redirect after saving
                </Label>
              </div>

              {/* Submit Button and Clear Form Button */}
              <div className="pt-4 flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full bg-primary text-white"
                  // Disable if loading OR if it's an edit and form isn't dirty
                  disabled={
                    isLoading || (id !== "new" && !isDirty) || isUploading
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Category"
                  )}
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  variant="outline"
                  onClick={clearForm}
                  disabled={!isDirty || isLoading || isUploading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear Form
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, ArrowLeft, X, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import Image from "next/image";
import { uploadImageToSupabase, saveProduct } from "@/actions/adminActions";
import { categoryOptions } from "@/constants/data";
import { ProductCategory } from "@/types/dashboard";
import useSWR from "swr";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[200px] rounded-md border p-4">Loading editor...</div>
  ),
});

// Define the schema for form validation with image_url as string array
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  short_description: z.string().min(1, "Short description is required"),
  description: z.string().optional(),
  price: z.coerce
    .number()
    .min(0.01, "Price must be greater than 0")
    .multipleOf(0.01),
  category: z.enum(["lip_gloss", "skin_care", "supplements"]),
  image_url: z.array(z.string().url("Must be a valid URL")).default([]),
  stock_quantity: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity must be non-negative"),
  is_active: z.boolean(),
  is_bestseller: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm({
  id,
  initialData,
}: {
  id: string;
  initialData: ProductFormData;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Use SWR for product data
  const { data: productData, mutate } = useSWR<ProductFormData>(
    `product-${id}`,
    null, // No fetcher function because we're using initialData
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  );

  // Create a type-safe mutate function to handle partial updates
  const safeUpdateCache = useCallback(
    (newData: Partial<ProductFormData>) => {
      // Ensure all required fields are present by merging with existing data
      const completeData: ProductFormData = {
        name: newData.name ?? productData?.name ?? "",
        short_description:
          newData.short_description ?? productData?.short_description ?? "",
        description: newData.description ?? productData?.description ?? "",
        price: newData.price ?? productData?.price ?? 0,
        category: newData.category ?? productData?.category ?? "skin_care",
        image_url: newData.image_url ?? productData?.image_url ?? [],
        stock_quantity:
          newData.stock_quantity ?? productData?.stock_quantity ?? 0,
        is_active: newData.is_active ?? productData?.is_active ?? true,
        is_bestseller:
          newData.is_bestseller ?? productData?.is_bestseller ?? false,
      };

      // Now mutate with the complete data
      mutate(completeData, false);
    },
    [mutate, productData]
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: productData || {
      name: "",
      short_description: "",
      description: "",
      price: 0,
      category: "skin_care" as ProductCategory,
      image_url: [],
      stock_quantity: 0,
      is_active: true,
      is_bestseller: false,
    },
  });

  // Watch the image_url for the UI
  const currentImages = watch("image_url");

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);

    try {
      const result = await saveProduct(data, id);

      if (result.success) {
        // Update SWR cache with new data
        safeUpdateCache(data);

        toast.success(
          `Product ${id === "new" ? "created" : "updated"} successfully`
        );
        router.push("/admin/products");
      } else {
        toast.error(`Failed to save product: ${result.error}`);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(`Failed to save product: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "product-images");
      const imageUrl = await uploadImageToSupabase(formData);

      if (imageUrl) {
        // Update local form state
        const newImages = [...currentImages, imageUrl];
        setValue("image_url", newImages, {
          shouldDirty: true,
        });

        // Also update SWR cache to keep it in sync
        safeUpdateCache({
          image_url: newImages,
        });

        toast.success("Image uploaded successfully");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Error uploading image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);

    // Update form state
    setValue("image_url", newImages, { shouldDirty: true });

    // Also update SWR cache to keep it in sync
    safeUpdateCache({
      image_url: newImages,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 sm:py-6">
      <Card className="max-w-6xl mx-auto sm:shadow-md border-none sm:border">
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
              {id === "new" ? "Create New Product" : "Edit Product"}
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Name*
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

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price*
                </label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="price"
                      type="number"
                      step="0.01"
                      className="w-full"
                    />
                  )}
                />
                {errors.price && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="stock_quantity"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Stock Quantity*
                </label>
                <Controller
                  name="stock_quantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="stock_quantity"
                      type="number"
                      className="w-full"
                    />
                  )}
                />
                {errors.stock_quantity && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.stock_quantity.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category*
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images
                </label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  {currentImages.map((url, index) => (
                    <div key={index} className="relative group aspect-square">
                      <div className="h-full w-full border rounded-md overflow-hidden relative">
                        <Image
                          src={url}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <label className="border rounded-md flex items-center justify-center cursor-pointer aspect-square">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Plus className="h-8 w-8 mb-1" />
                      <span className="text-xs">Add Image</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                        e.target.value = "";
                      }}
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {errors.image_url && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.image_url.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="short_description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Short Description*
                </label>
                <Controller
                  name="short_description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor {...field} className="min-h-[150px]" />
                  )}
                />
                {errors.short_description && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.short_description.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description (Optional)
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor {...field} className="min-h-[300px]" />
                  )}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="is_active"
                        className="text-sm font-medium text-gray-700"
                      >
                        Is Active
                      </label>
                    </div>
                  )}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="is_bestseller"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_bestseller"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="is_bestseller"
                        className="text-sm font-medium text-gray-700"
                      >
                        Is Bestseller
                      </label>
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/products")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-white hover:bg-primary/90"
                disabled={isLoading || !isDirty || isUploading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

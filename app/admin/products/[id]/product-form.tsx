"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  Input,
  Checkbox,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  Label,
} from "@/constants/ui/index";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  X,
  Plus,
  ChevronsUpDown,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { uploadImageToSupabase, saveProduct } from "@/actions/adminActions";
import type { Category } from "@/types/index";
import useSWR from "swr";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[200px] rounded-md border p-4">Loading editor...</div>
  ),
});

// --- Define Color Options (remains the same) ---
// const skinToneColors: ColorInfo[] = [
//   { name: "Fair", hex: "#EFD1B3" },
//   { name: "Medium", hex: "#DDBAA0" },
//   { name: "Tan", hex: "#C49181" },
//   { name: "Deep", hex: "#755237" },
// ];

// --- Define Zod schema for ColorInfo (remains the same) ---
const colorInfoSchema = z.object({
  name: z.string(),
  hex: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format"),
});

// --- Define Zod schema for AdditionalDetailItem ---
const additionalDetailItemSchema = z.object({
  id: z.string().optional(), // ID from useFieldArray, not for DB
  key: z.string().min(1, "Key cannot be empty"),
  value: z.string().min(1, "Value cannot be empty"),
});
// --- End Zod schema ---

// --- Update productSchema ---
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  short_description: z.string().min(1, "Short description is required"),
  description: z.string().optional(),
  price: z.coerce
    .number()
    .min(0.01, "Price must be greater than 0")
    .multipleOf(0.01),
  compare_price: z.coerce
    .number()
    .min(0, "Compare price must be non-negative")
    .multipleOf(0.01)
    .nullable()
    .optional(),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  image_url: z.array(z.string().url("Must be a valid URL")).default([]),
  stock_quantity: z.coerce
    .number()
    .int()
    .min(0, "Stock quantity must be non-negative"),
  is_active: z.boolean().optional().default(false),
  is_bestseller: z.boolean().optional().default(false),
  color: z.array(colorInfoSchema).default([]),
  additional_details: z.array(additionalDetailItemSchema).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductForm({
  id,
  initialData,
  categoryData,
}: {
  id: string;
  initialData: ProductFormData;
  categoryData: Category[];
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories] = useState<Category[]>(categoryData || []);

  const normalizedInitialData = useMemo(
    (): ProductFormData => ({
      ...initialData,
      color: Array.isArray(initialData?.color) ? initialData.color : [],
      additional_details: Array.isArray(initialData?.additional_details)
        ? initialData.additional_details
        : [],
    }),
    [initialData]
  );

  const { data: productData, mutate } = useSWR<ProductFormData>(
    `product-${id}`,
    null,
    {
      fallbackData: normalizedInitialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: (_data) => {
        if (id === "new") {
          mutate(undefined, { revalidate: false });
        }
      },
    }
  );

  const safeUpdateCache = useCallback(
    (newData: Partial<ProductFormData>) => {
      // Ensure arrays are handled correctly during merge
      const currentProductData = productData || normalizedInitialData;
      const completeData: ProductFormData = {
        name: newData.name ?? currentProductData.name,
        short_description:
          newData.short_description ?? currentProductData.short_description,
        description: newData.description ?? currentProductData.description,
        price: newData.price ?? currentProductData.price,
        compare_price:
          newData.compare_price !== undefined
            ? newData.compare_price
            : currentProductData.compare_price,
        categoryIds: newData.categoryIds ?? currentProductData.categoryIds,
        image_url: newData.image_url ?? currentProductData.image_url,
        stock_quantity:
          newData.stock_quantity ?? currentProductData.stock_quantity,
        is_active: newData.is_active ?? currentProductData.is_active,
        is_bestseller:
          newData.is_bestseller ?? currentProductData.is_bestseller,
        color: newData.color ?? currentProductData.color ?? [],
        additional_details:
          newData.additional_details ??
          currentProductData.additional_details ??
          [],
      };
      mutate(completeData, false);
    },
    [mutate, productData, normalizedInitialData]
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: productData || {
      name: "",
      short_description: "",
      description: "",
      price: 0,
      compare_price: null,
      categoryIds: [],
      image_url: [],
      stock_quantity: 0,
      is_active: true,
      is_bestseller: false,
      color: [],
      additional_details: [],
    },
  });

  useEffect(() => {
    return () => {
      if (id === "new") {
        reset();
        mutate(undefined, { revalidate: false });
      }
    };
  }, [id, reset, mutate]);

  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
  } = useFieldArray({
    control,
    name: "additional_details",
  });
  // --- End setup ---

  const currentImages = watch("image_url");
  // const currentColors = watch("color");

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const saveData = {
        ...data,
        additional_details: data.additional_details.map(
          ({ id: _, ...rest }) => rest
        ),
      };
      if (saveData.compare_price && saveData.compare_price <= saveData.price) {
        toast.warning("Compare price must be greater than the price");
        return;
      }
      const result = await saveProduct(saveData, id);
      if (result.success) {
        toast.success(
          `Product ${id === "new" ? "created" : "updated"} successfully`
        );

        if (id !== "new") {
          safeUpdateCache(saveData);
        }
        if (id === "new") {
          setValue("image_url", []);
          reset({
            ...productData,
            image_url: [],
            additional_details: [],
            color: [],
          });
        }

        // empty the form cache
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.warning(
          `Failed to save product: ${result.error || "Unknown error"}`
        );
      }
    } catch (error) {
      const err = error as Error;
      toast.warning(`Failed to save product: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Image upload/remove logic remains the same
  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "product-images");
      formData.append("title", watch("name") || "Product Image");

      const result = await uploadImageToSupabase(formData);

      if (result.success && result.data) {
        const newImages = [...(currentImages || []), result.data];
        setValue("image_url", newImages, { shouldDirty: true });
        safeUpdateCache({ image_url: newImages });
        toast.success("Image uploaded successfully");
      } else {
        toast.warning(result.error || "Failed to upload image.");
      }
    } catch (error) {
      toast.warning("Error uploading image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = (currentImages || []).filter((_, i) => i !== index);
    setValue("image_url", newImages, { shouldDirty: true });
    safeUpdateCache({ image_url: newImages });
  };

  // --- Helper to handle color selection change ---
  // const handleColorChange = (checked: boolean, colorInfo: ColorInfo) => {
  //   const currentSelection = currentColors || [];
  //   let newSelection: ColorInfo[];

  //   if (checked) {
  //     // Add color if not already present
  //     if (!currentSelection.some((c) => c.name === colorInfo.name)) {
  //       newSelection = [...currentSelection, colorInfo];
  //     } else {
  //       newSelection = currentSelection; // Already exists, no change needed
  //     }
  //   } else {
  //     // Remove color
  //     newSelection = currentSelection.filter((c) => c.name !== colorInfo.name);
  //   }
  //   setValue("color", newSelection, { shouldDirty: true });
  //   safeUpdateCache({ color: newSelection }); // Update cache
  // };

  return (
    <div className="min-h-screen bg-gray-50 sm:py-6">
      <Card className="max-w-6xl mx-auto sm:shadow-md border-none sm:border">
        <CardContent className="pt-6 p-0 sm:p-6">
          {/* Header remains the same */}
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="mb-1">
                  Product Name*
                </Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="name"
                      placeholder="e.g., Hydrating Foundation"
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <Label htmlFor="price" className="mb-1">
                  Price*
                </Label>
                <Controller
                  name="price"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={
                        field.value === undefined ? "" : field.value.toString()
                      }
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                    />
                  )}
                />
                {errors.price && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Compare Price */}
              <div>
                <Label htmlFor="compare_price" className="mb-1">
                  Compare Price
                </Label>
                <Controller
                  name="compare_price"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      id="compare_price"
                      type="number"
                      step="0.01"
                      placeholder="Optional original price"
                    />
                  )}
                />
                {errors.compare_price && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.compare_price.message}
                  </p>
                )}
              </div>

              {/* Stock Quantity */}
              <div>
                <Label htmlFor="stock_quantity" className="mb-1">
                  Stock Quantity*
                </Label>
                <Controller
                  name="stock_quantity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={
                        field.value === undefined ? "" : field.value.toString()
                      }
                      onChange={(e) => {
                        console.log(e.target.value);
                        field.onChange(Number(e.target.value));
                      }}
                      id="stock_quantity"
                      type="number"
                      placeholder="0"
                    />
                  )}
                />
                {errors.stock_quantity && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.stock_quantity.message}
                  </p>
                )}
              </div>

              {/* Categories Dropdown */}
              <div>
                <Label htmlFor="categoryIds" className="mb-1">
                  Categories*
                </Label>
                <Controller
                  name="categoryIds"
                  control={control}
                  render={({ field, fieldState }) => {
                    const selectedNames = (field.value || [])
                      .map((id) => categories.find((c) => c.id === id)?.name)
                      .filter(Boolean)
                      .join(", ");
                    return (
                      <div className="space-y-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between text-left font-normal" // Adjust style
                              id="categoryIds"
                            >
                              <span className="truncate pr-2">
                                {selectedNames || "Select categories..."}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-60 overflow-y-auto">
                            {/* Match trigger width */}
                            {categories.map((category) => (
                              <DropdownMenuCheckboxItem
                                key={category.id}
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, category.id]);
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== category.id)
                                    );
                                  }
                                }}
                              >
                                {category.name}
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {fieldState.error && (
                          <p className="text-red-600 text-sm mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
                {/* Note: errors.categoryIds might still be useful for general array errors */}
              </div>

              {/* --- MULTI-SELECT COLOR DROPDOWN --- */}
              {/* <div>
                <Label htmlFor="color-trigger" className="mb-1">
                  Skin Tone Colors
                </Label>
                <Controller
                  name="color" // Control the array
                  control={control}
                  render={({ field, fieldState }) => {
                    const selectedColorNames = (field.value || [])
                      .map((c) => c.name)
                      .join(", ");
                    return (
                      <div className="space-y-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              id="color-trigger"
                              variant="outline"
                              className="w-full justify-between text-left font-normal"
                            >
                              <span className="truncate pr-2">
                                {selectedColorNames || "Select colors..."}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                            {skinToneColors.map((colorOption) => (
                              <DropdownMenuCheckboxItem
                                key={colorOption.name}
                                // Check if the current color name exists in the field value array
                                checked={(field.value || []).some(
                                  // Add safe check
                                  (c) => c.name === colorOption.name
                                )}
                                // Pass the boolean state and the full color object to the handler
                                onCheckedChange={(checked) =>
                                  handleColorChange(checked, colorOption)
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-4 w-4 rounded-full inline-block border"
                                    style={{ backgroundColor: colorOption.hex }}
                                  />
                                  {colorOption.name}
                                </div>
                              </DropdownMenuCheckboxItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {fieldState.error && (
                          // Display error for the 'color' array field itself if any
                          <p className="text-red-600 text-sm mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    );
                  }}
                />
              </div> */}
              {/* --- END MULTI-SELECT COLOR DROPDOWN --- */}
            </div>
            {/* --- Row 2: Images --- */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {/* Image mapping and upload button - unchanged */}
                {(currentImages || []).map(
                  (
                    url,
                    index // Add safe check
                  ) => (
                    <div
                      key={url || index}
                      className="relative group aspect-square"
                    >
                      {/* ... image display ... */}
                      <Image
                        src={url}
                        alt={`Product image ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                        className="object-cover border rounded-md bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 hover:bg-white"
                        aria-label="Remove image"
                      >
                        <X className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  )
                )}
                <div className="aspect-square">
                  <label
                    htmlFor="image-upload"
                    className="h-full w-full border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-colors text-gray-400 hover:text-primary"
                    aria-disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="text-center">
                        <Loader2 className="h-6 w-6 mx-auto animate-spin" />
                        <p className="text-xs mt-1">Uploading...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Plus className="h-6 w-6 mx-auto" />
                        <p className="text-xs mt-1">Add Image</p>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        const productName = watch("name");

                        if (!productName || productName.trim() === "") {
                          toast.warning(
                            "Please enter a product name before uploading an image."
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
              {errors.image_url && (
                <p className="text-sm text-red-500 mt-1">
                  {/* Displaying array-level errors if needed */}
                  {typeof errors.image_url.message === "string"
                    ? errors.image_url.message
                    : "Error with images"}
                </p>
              )}
            </div>
            {/* --- Row 3: Descriptions --- */}
            <div className="grid grid-cols-1 gap-6">
              {/* Short Description */}
              <div>
                <Label htmlFor="short_description" className="mb-1">
                  Short Description*
                </Label>
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

              {/* Full Description */}
              <div>
                <Label htmlFor="description" className="mb-1">
                  Full Description
                </Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor {...field} className="min-h-[300px]" />
                  )}
                />
              </div>
            </div>
            {/* --- Row 4: Additional Details --- */}
            <div className="space-y-4 p-4 border rounded-md bg-white">
              <Label className="text-base font-medium">
                Additional Details
              </Label>
              {/* *** THE FIX IS HERE *** */}
              {(detailFields || []).map((item, index) => (
                <div
                  key={item.id} // useFieldArray provides a stable id
                  className="flex items-start gap-3 p-3 border rounded-md"
                >
                  <div className="grid grid-cols-2 gap-3 flex-grow">
                    {/* Key Input */}
                    <div className="space-y-1">
                      <Label
                        htmlFor={`additional_details.${index}.key`}
                        className="text-xs"
                      >
                        Detail Key*
                      </Label>
                      <Controller
                        name={`additional_details.${index}.key`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            id={`additional_details.${index}.key`}
                            placeholder="e.g., Weight"
                          />
                        )}
                      />
                      {errors.additional_details?.[index]?.key && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.additional_details[index]?.key?.message}
                        </p>
                      )}
                    </div>
                    {/* Value Input */}
                    <div className="space-y-1">
                      <Label
                        htmlFor={`additional_details.${index}.value`}
                        className="text-xs"
                      >
                        Detail Value*
                      </Label>
                      <Controller
                        name={`additional_details.${index}.value`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id={`additional_details.${index}.value`}
                            placeholder="e.g., 100g"
                          />
                        )}
                      />
                      {errors.additional_details?.[index]?.value && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.additional_details[index]?.value?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDetail(index)}
                    className="mt-5 flex-shrink-0 text-destructive hover:bg-destructive/10" // Adjusted margin-top
                    aria-label="Remove detail"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {/* Add Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendDetail({ key: "", value: "" })}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Detail
              </Button>
              {/* Display root errors for the array (e.g., minimum length if added to schema) */}
              {errors.additional_details &&
                !Array.isArray(errors.additional_details) &&
                errors.additional_details.root && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.additional_details.root.message}
                  </p>
                )}
              {/* Display generic array errors if needed */}
              {errors.additional_details &&
                typeof errors.additional_details.message === "string" && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.additional_details.message}
                  </p>
                )}
            </div>
            {/* --- Row 5: Flags --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="is_active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active (visible)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="is_bestseller"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="is_bestseller"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="is_bestseller" className="cursor-pointer">
                  Bestseller (featured)
                </Label>
              </div>
            </div>
            {/* --- Row 6: Actions --- */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isDirty || isUploading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
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

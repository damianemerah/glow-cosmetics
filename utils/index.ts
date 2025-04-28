import type { ProductAdditionalDetails } from "@/types/index";
import { Json } from "@/types/types";

export function formatZAR(price: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(price);
}

/**
 * Safely transforms a Json | null value (expected to be an array of objects
 * with key/value pairs) into ProductAdditionalDetails (AdditionalDetailItem[]).
 * Filters out invalid items and handles non-array inputs.
 */
export function transformToAdditionalDetails(
  data: Json | null,
): ProductAdditionalDetails {
  if (!Array.isArray(data)) {
    return [];
  }

  const validDetails: ProductAdditionalDetails = [];

  for (const item of data) {
    if (
      typeof item === "object" &&
      item !== null &&
      "key" in item && typeof item.key === "string" &&
      "value" in item && (
        typeof item.value === "string" ||
        typeof item.value === "number" ||
        typeof item.value === "boolean"
      )
    ) {
      validDetails.push({
        key: item.key,
        value: String(item.value),
      });
    } else {
      console.warn("Skipping invalid item in additional_details:", item);
    }
  }

  return validDetails;
}

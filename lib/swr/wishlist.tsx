import useSWR from "swr";
import { isProductInWishlist } from "@/actions/wishlistActions";

const fetchWishlistStatus = async ([userId, productId]: [string, string]) => {
  const result = await isProductInWishlist(userId, productId);
  if (!result.success)
    throw new Error(result.error || "Failed to fetch wishlist status");
  return result.isInWishlist;
};

export const useWishlistStatus = (
  userId: string | undefined,
  productId: string
) => {
  return useSWR(userId ? [userId, productId] : null, fetchWishlistStatus);
};

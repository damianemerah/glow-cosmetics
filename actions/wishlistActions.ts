"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

interface WishlistError {
    message: string;
    code?: string;
}

/**
 * Toggles a product in the user's wishlist (adds if not exists, removes if exists)
 */
export async function toggleWishlistItem(userId: string, productId: string) {
    try {
        const supabase = await createClient();

        // Check if item is already in wishlist
        const { data: existingItem } = await supabase
            .from("wishlists")
            .select("id")
            .eq("user_id", userId)
            .eq("product_id", productId)
            .single();

        if (existingItem) {
            // Item exists, so remove it
            const { error: deleteError } = await supabase
                .from("wishlists")
                .delete()
                .eq("id", existingItem.id);

            if (deleteError) throw deleteError;

            revalidatePath("/products");
            return {
                success: true,
                added: false,
                message: "Removed from wishlist",
            };
        } else {
            // Item doesn't exist, so add it
            const { error: insertError } = await supabase
                .from("wishlists")
                .insert({ user_id: userId, product_id: productId });

            if (insertError) throw insertError;

            revalidatePath("/products");
            return { success: true, added: true, message: "Added to wishlist" };
        }
    } catch (error: unknown) {
        const wishlistError = error as WishlistError;
        console.error("Error toggling wishlist item:", wishlistError);
        return {
            success: false,
            error: wishlistError.message || "Failed to update wishlist",
        };
    }
}

/**
 * Gets all wishlist items for a user
 */
export async function getUserWishlist(userId: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("wishlists")
            .select(`
        id,
        product_id,
        products (
          id,
          name,
          price,
          compare_price,
          image_url,
          slug,
          stock_quantity,
          is_bestseller
        )
      `)
            .eq("user_id", userId);

        if (error) throw error;

        return {
            success: true,
            data: data || [],
        };
    } catch (error: unknown) {
        const wishlistError = error as WishlistError;
        console.error("Error fetching user wishlist:", wishlistError);
        return {
            success: false,
            error: wishlistError.message || "Failed to fetch wishlist",
            data: [],
        };
    }
}

/**
 * Checks if a specific product is in the user's wishlist
 */
export async function isProductInWishlist(userId: string, productId: string) {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from("wishlists")
            .select("id")
            .eq("user_id", userId)
            .eq("product_id", productId)
            .single();

        if (error && error.code !== "PGRST116") throw error; // PGRST116 is not found

        return {
            success: true,
            isInWishlist: !!data,
        };
    } catch (error: unknown) {
        const wishlistError = error as WishlistError;
        console.error("Error checking wishlist status:", wishlistError);
        return {
            success: false,
            error: wishlistError.message || "Failed to check wishlist status",
            isInWishlist: false,
        };
    }
}

/**
 * Removes a product from wishlist
 */
export async function removeFromWishlist(wishlistItemId: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from("wishlists")
            .delete()
            .eq("id", wishlistItemId);

        if (error) throw error;

        revalidatePath("/wishlist");
        return { success: true };
    } catch (error: unknown) {
        const wishlistError = error as WishlistError;
        console.error("Error removing from wishlist:", wishlistError);
        return {
            success: false,
            error: wishlistError.message || "Failed to remove from wishlist",
        };
    }
}

"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/types";

type CartItem = Database["public"]["Tables"]["cart_items"]["Insert"];
type Product = Database["public"]["Tables"]["products"]["Row"];

export type CartProduct = Pick<Product, "id" | "name" | "price" | "image_url">;

// Get or create cart for user
export async function getOrCreateCart(userId: string) {
  // Check for existing active cart
  const supabase = await createClient();

  const { data: existingCart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (cartError && cartError.code !== "PGRST116") {
    console.error("Error fetching cart:", cartError);
    throw cartError;
  }

  // If cart exists, return it
  if (existingCart) {
    return existingCart;
  }

  // Create new cart if none exists
  const { data: newCart, error: createError } = await supabase
    .from("carts")
    .insert([{ user_id: userId, status: "active" }])
    .select()
    .single();

  if (createError) {
    console.error("Error creating cart:", createError);
    throw createError;
  }

  return newCart;
}

// Add item to cart
export async function addToCart(
  userId: string,
  product: CartProduct,
  quantity: number = 1
) {
  try {
    const supabase = await createClient();

    // Get or create cart
    const cart = await getOrCreateCart(userId);

    console.log(cart, "🌐");

    // Check if product already exists in cart
    const { data: existingItems, error: checkError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", product.id);

    console.log(existingItems, "🌐2");

    if (checkError) {
      console.error("Error checking cart items:", checkError);
      throw checkError;
    }

    if (existingItems && existingItems.length > 0) {
      // Update quantity if item exists
      const existingItem = existingItems[0];
      const newQuantity = existingItem.quantity + quantity;

      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("Error updating item quantity:", updateError);
        throw updateError;
      }
    } else {
      // Add new item to cart
      const cartItem: CartItem = {
        cart_id: cart.id,
        product_id: product.id,
        quantity: quantity,
        price_at_time: product.price,
      };

      const { error: insertError } = await supabase
        .from("cart_items")
        .insert([cartItem]);

      if (insertError) {
        console.error("Error adding item to cart:", insertError);
        throw insertError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in addToCart:", error);
    return { success: false, error };
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = await createClient();

  try {
    if (quantity < 1) {
      return { success: false, error: "Quantity must be at least 1" };
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateCartItemQuantity:", error);
    return { success: false, error };
  }
}

// Remove item from cart
export async function removeCartItem(itemId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error in removeCartItem:", error);
    return { success: false, error };
  }
}

// Get cart with items
export async function getCartWithItems(userId: string) {
  const supabase = await createClient();

  try {
    // Get active cart
    const { data: cartData, error: cartError } = await supabase
      .from("carts")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (cartError) {
      if (cartError.code === "PGRST116") {
        // No cart found
        return { cart: null, items: [] };
      }
      console.error("Error fetching cart:", cartError);
      throw cartError;
    }

    // Get cart items with product details
    const { data: itemsData, error: itemsError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        cart_id,
        product_id,
        quantity,
        price_at_time,
        product:products(id, name, price, image_url)
      `
      )
      .eq("cart_id", cartData.id);

    if (itemsError) {
      console.error("Error fetching cart items:", itemsError);
      throw itemsError;
    }

    return { cart: cartData, items: itemsData || [] };
  } catch (error) {
    console.error("Error in getCartWithItems:", error);
    return { cart: null, items: [], error };
  }
}

// Get cart count (returns the total number of items considering quantities)
export async function getCartItemsCount(userId: string): Promise<number> {
  try {
    const { cart, items } = await getCartWithItems(userId);

    if (!cart) return 0;

    // Sum up all quantities
    return items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
}

// Get cart items count (returns the number of unique products in cart)
export async function getCartItemCount(userId: string): Promise<number> {
  try {
    const supabase = await createClient();

    // First get the user's cart
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (cartError) {
      if (cartError.code === "PGRST116") {
        // No cart found
        return 0;
      }
      console.error("Error fetching cart:", cartError);
      return 0;
    }

    // Then count items in the cart
    const { count, error: countError } = await supabase
      .from("cart_items")
      .select("*", { count: "exact", head: true })
      .eq("cart_id", cart.id);

    if (countError) {
      console.error("Error counting cart items:", countError);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getCartItemCount:", error);
    return 0;
  }
}

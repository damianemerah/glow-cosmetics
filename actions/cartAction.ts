"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/types";
import { revalidatePath } from "next/cache";
import { OfflineCartItem } from "@/store/cartStore";

type CartItem = Database["public"]["Tables"]["cart_items"]["Insert"];
type Product = Database["public"]["Tables"]["products"]["Row"];

export type CartProduct = Pick<Product, "id" | "name" | "price" | "image_url">;

// Get or create cart for user
export async function getOrCreateCart(userId: string) {
  console.log(`Finding or creating cart for user ${userId}`);

  // Check for existing active cart
  const supabase = await createClient();

  const { data: existingCart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();
  // .eq("status", "active")

  if (cartError) {
    if (cartError.code === "PGRST116") {
      console.log(`No existing cart found for user ${userId}, creating new cart`);
    } else {
      console.error("Error fetching cart:", cartError);
      throw cartError;
    }
  }

  // If cart exists, return it
  if (existingCart) {
    console.log(`Found existing cart for user ${userId}:`, existingCart);
    return existingCart;
  }

  // Create new cart if none exists
  console.log(`Creating new cart for user ${userId}`);
  const { data: newCart, error: createError } = await supabase
    .from("carts")
    .insert([{ user_id: userId }])
    .select()
    .single();

  if (createError) {
    console.error("Error creating cart:", createError);
    throw createError;
  }

  console.log(`Successfully created new cart:`, newCart);
  return newCart;
}

// Add item to cart
export async function addToCart(
  userId: string,
  product: CartProduct,
  quantity: number = 1,
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

    revalidatePath("/", "layout");

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
      .single();
    // .eq("status", "active")

    if (cartError) {
      console.log(cartError, "cartError🚀🚀");
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
      `,
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
      .single();
    // .eq("status", "active")

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

/**
 * Merge offline cart items with server cart
 *
 * This function is called when a user logs in with items in their offline cart.
 * It adds the offline items to the user's server cart using direct database operations.
 */
export async function mergeOfflineCart(
  userId: string,
  offlineItems: OfflineCartItem[]
) {
  if (!userId || !offlineItems.length) {
    return { success: true, message: "No items to merge", itemsAdded: 0 };
  }

  try {
    const supabase = await createClient();

    // Get or create user's cart
    const cart = await getOrCreateCart(userId);

    // Get fresh product data for all offline items to ensure current prices
    const offlineProductIds = offlineItems.map(item => item.id);
    const { data: currentProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", offlineProductIds);

    if (productsError) {
      console.error("Error fetching current product data:", productsError);
      return { success: false, error: productsError };
    }

    // Map of product id to current price and name
    const productDataMap = new Map();
    currentProducts?.forEach(product => {
      productDataMap.set(product.id, { price: product.price, name: product.name });
    });

    // Get current cart items to check for existing products
    const { data: existingCartItems, error: cartItemsError } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity")
      .eq("cart_id", cart.id)
      .in("product_id", offlineProductIds);

    if (cartItemsError) {
      console.error("Error fetching existing cart items:", cartItemsError);
      return { success: false, error: cartItemsError };
    }

    // Map product_id to existing cart item for quick lookup
    const existingItemsMap = new Map();
    existingCartItems?.forEach(item => {
      existingItemsMap.set(item.product_id, item);
    });

    // Process each offline item individually
    const results = {
      success: true,
      itemsProcessed: 0,
      itemsAdded: 0,
      errors: [] as string[]
    };

    // Process items sequentially
    for (const offlineItem of offlineItems) {
      // Skip items with 0 or negative quantity
      if (offlineItem.quantity <= 0) continue;

      const productData = productDataMap.get(offlineItem.id);
      if (!productData) {
        console.error(`Product data not found for item ${offlineItem.id}`);
        results.errors.push(`Failed to merge item: Product not found`);
        continue;
      }

      try {
        const existingItem = existingItemsMap.get(offlineItem.id);



        if (existingItem) {
          // Update existing cart item quantity
          const newQuantity = offlineItem.quantity;

          const { error: updateError } = await supabase
            .from("cart_items")
            .update({
              quantity: newQuantity,
              price_at_time: productData.price, // Update with current price
            })
            .eq("id", existingItem.id);


          if (updateError) {
            console.error(`Error updating cart item ${existingItem.id}:`, updateError);
            results.errors.push(`Failed to update ${productData.name}: ${updateError.message}`);
          } else {
            results.itemsProcessed++;
            results.itemsAdded++;
          }
        } else {
          // Insert new cart item
          const { error: insertError } = await supabase
            .from("cart_items")
            .insert([{
              cart_id: cart.id,
              product_id: offlineItem.id,
              quantity: offlineItem.quantity,
              price_at_time: productData.price,
            }]);

          if (insertError) {
            console.error(`Error inserting cart item for product ${offlineItem.id}:`, insertError);
            results.errors.push(`Failed to add ${productData.name}: ${insertError.message}`);
          } else {
            results.itemsProcessed++;
            results.itemsAdded++;
          }
        }
      } catch (error) {
        console.error(`Exception processing item ${offlineItem.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Error merging ${productData.name}: ${errorMessage}`);
      }
    }

    // Set overall success based on whether any items were processed
    results.success = results.itemsProcessed > 0;

    // Revalidate relevant paths after merging cart
    if (results.success) {
      revalidatePath("/", "layout");
    }

    return {
      success: results.success,
      message: results.success
        ? `Offline cart merged successfully: ${results.itemsAdded} items`
        : "Failed to merge offline cart",
      itemsAdded: results.itemsAdded,
      errors: results.errors.length > 0 ? results.errors : undefined
    };
  } catch (error) {
    console.error("Error merging offline cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      itemsAdded: 0
    };
  }
}

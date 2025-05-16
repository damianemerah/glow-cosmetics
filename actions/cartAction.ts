"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { OfflineCartItem } from "@/store/cartStore";
import { CartItemInputData } from "@/types/index";

type CartActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  message?: string;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Inside cart.actions.ts

export async function getOrCreateCart(userId: string) {
  // Validate user existence first (optional but helps prevent 23503 early)
  const { data: userExists, error: userCheckError } = await supabaseAdmin
    .from("profiles") // Check directly against auth.users if possible, or profiles if guaranteed sync
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (userCheckError || !userExists) {
    console.error(
      `User check failed or user ${userId} not found before cart operation:`,
      userCheckError,
    );
    // Decide how to handle: throw, return null, etc.
    // Throwing is often safer to prevent operations on non-existent users.
    throw new Error(`User ${userId} not found or inaccessible.`);
  }

  // First, try to select the existing cart
  const { data: existingCart, error: selectError } = await supabaseAdmin
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError && selectError.code !== "PGRST116") {
    // Handle unexpected select errors (permissions, etc.)
    console.error("Error selecting cart:", selectError);
    throw selectError; // Re-throw unexpected errors
  }

  // If cart exists, return it immediately
  if (existingCart) {
    return existingCart;
  }

  // If cart doesn't exist, attempt to insert, ignoring conflict if it was created concurrently
  console.log(
    `No existing cart found for user ${userId}, attempting insert...`,
  );
  const { data: newCart, error: insertError } = await supabaseAdmin
    .from("carts")
    .insert([{ user_id: userId }])
    .select()
    .maybeSingle(); // Use maybeSingle here too

  // Handle potential insert errors (like the 23503 foreign key if user check above wasn't done/failed)
  if (insertError) {
    // Specifically check if the error is the duplicate key we expect in a race condition
    if (insertError.code === "23505") {
      console.warn(
        `Race condition detected: Cart for ${userId} created concurrently. Fetching it again.`,
      );
      // If insert failed due to duplicate key, the cart MUST exist now, so re-fetch it
      const { data: raceCart, error: raceSelectError } = await supabaseAdmin
        .from("carts")
        .select("*")
        .eq("user_id", userId)
        .single(); // Use single() now, it should exist

      if (raceSelectError || !raceCart) {
        console.error(
          "CRITICAL: Failed to fetch cart after race condition:",
          raceSelectError,
        );
        // This case is problematic - insert failed for duplicate, but then couldn't select it?
        throw raceSelectError ||
          new Error("Failed to retrieve cart after detected race condition.");
      }
      return raceCart; // Return the cart fetched after the race
    } else {
      // Handle other insert errors (e.g., foreign key violation 23503)
      console.error("Error creating cart:", insertError);
      throw insertError; // Re-throw other critical insert errors
    }
  }

  if (!newCart) {
    // This shouldn't happen if insert succeeded without error, but check defensively
    console.error("Cart insert reported success but returned no data.");
    throw new Error("Failed to create or retrieve cart.");
  }

  console.log(`Successfully created new cart for user ${userId}`);
  return newCart;
}

// Add item to cart
export async function addToCart(
  userId: string,
  item: CartItemInputData,
  quantity: number = 1,
): Promise<CartActionResult> {
  if (!userId || !item || !item.id || quantity < 1) {
    return { success: false, error: "Invalid input provided." };
  }

  try {
    const { data: productData, error: productError } = await supabaseAdmin
      .from("products")
      .select("stock_quantity, is_active")
      .eq("id", item.id)
      .single();

    if (productError) {
      throw new Error(`Product check failed: ${productError.message}`);
    }
    if (!productData.is_active) {
      return { success: false, error: "Product is unavailable." };
    }
    if (productData.stock_quantity <= 0) {
      return { success: false, error: "Product is out of stock." };
    }

    const cart = await getOrCreateCart(userId);
    if (!cart) {
      return { success: false, error: "Could not retrieve or create cart." };
    }

    let existingItemQuery = supabaseAdmin
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cart.id)
      .eq("product_id", item.id);

    if (item.color) {
      existingItemQuery = existingItemQuery.eq("color", item.color.name);
    } else {
      existingItemQuery = existingItemQuery.is("color", null);
    }

    const { data: existingCartItem, error: existingItemError } =
      await existingItemQuery.maybeSingle();

    if (existingItemError) {
      throw new Error(`Cart check failed: ${existingItemError.message}`);
    }

    const currentCartQuantity = existingCartItem?.quantity || 0;
    const requestedTotalQuantity = currentCartQuantity + quantity;

    if (requestedTotalQuantity > productData.stock_quantity) {
      const availableToAdd = productData.stock_quantity - currentCartQuantity;
      return {
        success: false,
        error: `Only ${
          availableToAdd > 0 ? availableToAdd : 0
        } more item(s) can be added.`,
      };
    }

    const cartItemPayload = {
      cart_id: cart.id,
      product_id: item.id,
      quantity: requestedTotalQuantity,
      price_at_time: item.price,
      color: item.color?.name || null,
    };

    if (existingCartItem) {
      const { error: updateError } = await supabaseAdmin
        .from("cart_items")
        .update({
          quantity: requestedTotalQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCartItem.id);

      if (updateError) {
        throw new Error(`Failed to update cart: ${updateError.message}`);
      }

      return { success: true, message: "Item quantity updated in cart." };
    } else {
      const { error: insertError } = await supabaseAdmin
        .from("cart_items")
        .insert({
          ...cartItemPayload,
          quantity: quantity,
        });

      if (insertError) {
        throw new Error(`Failed to add item: ${insertError.message}`);
      }
      revalidatePath("/", "layout");
      return { success: true, message: "Item added to cart." };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : "An unknown error occurred";
    console.error("addToCart Action Failed:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    if (quantity < 1) {
      return { success: false, error: "Quantity must be at least 1" };
    }

    const { error } = await supabaseAdmin
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error in updateCartItemQuantity:", error);
    return { success: false, error };
  }
}

// Remove item from cart
export async function removeCartItem(itemId: string) {
  try {
    const { error } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error in removeCartItem:", error);
    return { success: false, error };
  }
}

// Get cart with items
export async function getCartWithItems(userId: string) {
  try {
    const cartData = await getOrCreateCart(userId);

    // Get cart items with product details
    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from("cart_items")
      .select(
        `
        id,
        cart_id,
        product_id,
        quantity,
        price_at_time,
        color,
        product:products(id, name, price, image_url, slug)
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

export async function mergeOfflineCart(
  userId: string,
  offlineItems: OfflineCartItem[],
): Promise<ActionResult<{ itemsAdded: number }>> {
  if (!userId) {
    return {
      success: false,
      error: "User ID is required",
      errorCode: "INVALID_USER_ID",
    };
  }

  if (!offlineItems.length) {
    return {
      success: true,
      data: { itemsAdded: 0 },
      message: "No items to merge",
    };
  }

  try {
    // Get or create user's cart
    const cart = await getOrCreateCart(userId);
    if (!cart) {
      return {
        success: false,
        error: "Failed to retrieve or create cart",
        errorCode: "CART_ERROR",
      };
    }

    // Get fresh product data for all offline items to ensure current prices
    const offlineProductIds = offlineItems.map((item) => item.id);
    const { data: currentProducts, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, stock_quantity, is_active")
      .in("id", offlineProductIds);

    if (productsError) {
      console.error("Error fetching current product data:", productsError);
      return {
        success: false,
        error: "Failed to fetch current product data",
        errorCode: "PRODUCT_FETCH_ERROR",
      };
    }

    // Map of product id to current price and name
    const productDataMap = new Map();
    currentProducts?.forEach((product) => {
      productDataMap.set(product.id, {
        price: product.price,
        name: product.name,
        stock_quantity: product.stock_quantity,
        is_active: product.is_active,
      });
    });

    // Get current cart items to check for existing products
    const { data: existingCartItems, error: cartItemsError } =
      await supabaseAdmin
        .from("cart_items")
        .select("id, product_id, quantity, color")
        .eq("cart_id", cart.id)
        .in("product_id", offlineProductIds);

    if (cartItemsError) {
      console.error("Error fetching existing cart items:", cartItemsError);
      return {
        success: false,
        error: "Failed to fetch existing cart items",
        errorCode: "CART_ITEMS_ERROR",
      };
    }

    // Map product_id to existing cart item for quick lookup
    const existingItemsMap = new Map();
    existingCartItems?.forEach((item) => {
      const key = item.color
        ? `${item.product_id}:${item.color}`
        : item.product_id;
      existingItemsMap.set(key, item);
    });

    // Process each offline item individually
    const results = {
      success: true,
      itemsProcessed: 0,
      itemsAdded: 0,
      errors: [] as string[],
    };

    // Process items sequentially
    for (const offlineItem of offlineItems) {
      // Skip items with 0 or negative quantity
      if (offlineItem.quantity <= 0) continue;

      const productData = productDataMap.get(offlineItem.id);
      if (!productData) {
        results.errors.push(`Product not found: ${offlineItem.id}`);
        continue;
      }

      // Skip inactive products
      if (!productData.is_active) {
        results.errors.push(
          `Product is no longer available: ${productData.name}`,
        );
        continue;
      }

      try {
        const itemKey = offlineItem.color?.name
          ? `${offlineItem.id}:${offlineItem.color.name}`
          : offlineItem.id;

        const existingItem = existingItemsMap.get(itemKey);

        if (existingItem) {
          // Update existing cart item quantity
          const newQuantity = Math.min(
            offlineItem.quantity + existingItem.quantity,
            productData.stock_quantity,
          );

          const { error: updateError } = await supabaseAdmin
            .from("cart_items")
            .update({
              quantity: newQuantity,
              price_at_time: productData.price,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingItem.id);

          if (updateError) {
            results.errors.push(
              `Failed to update ${productData.name}: ${updateError.message}`,
            );
          } else {
            results.itemsProcessed++;
            results.itemsAdded++;
          }
        } else {
          // Insert new cart item
          const actualQuantity = Math.min(
            offlineItem.quantity,
            productData.stock_quantity,
          );

          if (actualQuantity <= 0) {
            results.errors.push(`${productData.name} is out of stock`);
            continue;
          }

          const { error: insertError } = await supabaseAdmin
            .from("cart_items")
            .insert([{
              cart_id: cart.id,
              product_id: offlineItem.id,
              quantity: actualQuantity,
              price_at_time: productData.price,
              color: offlineItem.color?.name || null,
            }]);

          if (insertError) {
            results.errors.push(
              `Failed to add ${productData.name}: ${insertError.message}`,
            );
          } else {
            results.itemsProcessed++;
            results.itemsAdded++;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : "Unknown error";
        results.errors.push(
          `Error processing ${productData.name}: ${errorMessage}`,
        );
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
      data: { itemsAdded: results.itemsAdded },
      message: results.success
        ? `Offline cart merged successfully: ${results.itemsAdded} items`
        : "Failed to merge offline cart",
      error: results.errors.length > 0 ? results.errors.join(", ") : undefined,
      errorCode: results.errors.length > 0 ? "PARTIAL_MERGE_ERROR" : undefined,
    };
  } catch (error) {
    console.error("Error merging offline cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: "MERGE_EXCEPTION",
    };
  }
}

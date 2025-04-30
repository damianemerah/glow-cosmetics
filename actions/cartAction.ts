"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { OfflineCartItem } from "@/store/cartStore";
import { CartItemInputData } from "@/types/index";

type CartActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

// Get or create cart for user
export async function getOrCreateCart(userId: string) {
  console.log(`Finding or creating cart for user ${userId}`);

  // Check for existing active cart

  const { data: existingCart, error: cartError } = await supabaseAdmin
    .from("carts")
    .select("*")
    .eq("user_id", userId)
    .single();
  // .eq("status", "active")

  if (cartError) {
    if (cartError.code === "PGRST116") {
      console.log(
        `No existing cart found for user ${userId}, creating new cart`,
      );
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
  const { data: newCart, error: createError } = await supabaseAdmin
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
      console.log(
        `Cart item ${existingCartItem.id} quantity updated to ${requestedTotalQuantity}`,
      );
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
      console.log(
        `New cart item added for product ${item.id} with color ${
          item.color?.name || "N/A"
        }`,
      );
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

    return { success: true };
  } catch (error) {
    console.error("Error in removeCartItem:", error);
    return { success: false, error };
  }
}

// Get cart with items
export async function getCartWithItems(userId: string) {
  try {
    // Get active cart
    const { data: cartData, error: cartError } = await supabaseAdmin
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
) {
  if (!userId || !offlineItems.length) {
    return { success: true, message: "No items to merge", itemsAdded: 0 };
  }

  try {
    // Get or create user's cart
    const cart = await getOrCreateCart(userId);

    // Get fresh product data for all offline items to ensure current prices
    const offlineProductIds = offlineItems.map((item) => item.id);
    const { data: currentProducts, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price")
      .in("id", offlineProductIds);

    if (productsError) {
      console.error("Error fetching current product data:", productsError);
      return { success: false, error: productsError };
    }

    // Map of product id to current price and name
    const productDataMap = new Map();
    currentProducts?.forEach((product) => {
      productDataMap.set(product.id, {
        price: product.price,
        name: product.name,
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
      return { success: false, error: cartItemsError };
    }

    // Map product_id to existing cart item for quick lookup
    const existingItemsMap = new Map();
    existingCartItems?.forEach((item) => {
      existingItemsMap.set(item.product_id, item);
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
        console.error(`Product data not found for item ${offlineItem.id}`);
        results.errors.push(`Failed to merge item: Product not found`);
        continue;
      }

      try {
        const existingItem = existingItemsMap.get(offlineItem.id);

        if (existingItem) {
          // Update existing cart item quantity
          let newQuantity = offlineItem.quantity + existingItem.quantity;
          const availableStock = productData.stock_quantity;
          if (newQuantity > availableStock) {
            console.warn(
              `Offline cart exceeds stock for ${offlineItem.id}. Clamping.`,
            );
            newQuantity = availableStock;
          }

          const { error: updateError } = await supabaseAdmin
            .from("cart_items")
            .update({
              quantity: newQuantity,
              price_at_time: productData.price,
            })
            .eq("id", existingItem.id);

          if (updateError) {
            console.error(
              `Error updating cart item ${existingItem.id}:`,
              updateError,
            );
            results.errors.push(
              `Failed to update ${productData.name}: ${updateError.message}`,
            );
          } else {
            results.itemsProcessed++;
            results.itemsAdded++;
          }
        } else {
          // Insert new cart item
          const { error: insertError } = await supabaseAdmin
            .from("cart_items")
            .insert([{
              cart_id: cart.id,
              product_id: offlineItem.id,
              quantity: offlineItem.quantity,
              price_at_time: productData.price,
              color: offlineItem.color?.name || null,
            }]);

          if (insertError) {
            console.error(
              `Error inserting cart item for product ${offlineItem.id}:`,
              insertError,
            );
            results.errors.push(
              `Failed to add ${productData.name}: ${insertError.message}`,
            );
          } else {
            results.itemsProcessed++;
            results.itemsAdded++;
          }
        }
      } catch (error) {
        console.error(`Exception processing item ${offlineItem.id}:`, error);
        const errorMessage = error instanceof Error
          ? error.message
          : "Unknown error";
        results.errors.push(
          `Error merging ${productData.name}: ${errorMessage}`,
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
      message: results.success
        ? `Offline cart merged successfully: ${results.itemsAdded} items`
        : "Failed to merge offline cart",
      itemsAdded: results.itemsAdded,
      errors: results.errors.length > 0 ? results.errors : undefined,
    };
  } catch (error) {
    console.error("Error merging offline cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      itemsAdded: 0,
    };
  }
}

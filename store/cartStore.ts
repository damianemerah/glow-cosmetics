import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ColorInfo } from "@/types";

export interface OfflineCartItem {
    id: string;
    quantity: number;
    addedAt: number;
    color: ColorInfo | null;
    name: string;
    price: number;
    image_url: string[] | null;
    stock_quantity: number;
}

interface OfflineProductDetails {
    name: string;
    price: number;
    image_url: string[] | null;
    stock_quantity: number;
}

interface CartState {
    offlineItems: OfflineCartItem[];
    addOrUpdateOfflineItem: (
        productId: string,
        quantityChange: number,
        color: ColorInfo | null,
        productDetails: OfflineProductDetails,
    ) => void;
    setOfflineItemQuantity: (
        productId: string,
        colorName: string | null,
        newQuantity: number,
    ) => void;
    removeOfflineItem: (productId: string, colorName: string | null) => void;
    clearOfflineCart: () => void;
    getOfflineCartCount: () => number;
    getOfflineItemQuantity: (
        productId: string,
        colorName: string | null,
    ) => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            offlineItems: [],
            addOrUpdateOfflineItem: (
                productId,
                quantityChange,
                color,
                productDetails,
            ) => {
                set((state) => {
                    const items = [...state.offlineItems];
                    const existingItemIndex = items.findIndex(
                        (item) =>
                            item.id === productId &&
                            item.color?.name === color?.name,
                    );

                    const availableStock = productDetails.stock_quantity;

                    if (existingItemIndex > -1) {
                        const existingItem = items[existingItemIndex];
                        let newQuantity = existingItem.quantity +
                            quantityChange;

                        if (newQuantity > availableStock) {
                            console.warn(
                                `Offline cart exceeds stock for ${productId} (${
                                    color?.name || "N/A"
                                }). Clamping.`,
                            );
                            newQuantity = availableStock;
                        }
                        if (newQuantity <= 0) {
                            items.splice(existingItemIndex, 1);
                        } else {
                            items[existingItemIndex] = {
                                ...existingItem,
                                quantity: newQuantity,
                                addedAt: Date.now(),
                                price: productDetails.price,
                            };
                        }
                    } else if (quantityChange > 0) {
                        let initialQuantity = quantityChange;

                        if (initialQuantity > availableStock) {
                            console.warn(
                                `Offline cart exceeds stock for new item ${productId} (${
                                    color?.name || "N/A"
                                }). Clamping.`,
                            );
                            initialQuantity = availableStock;
                        }

                        if (initialQuantity > 0) {
                            items.push({
                                id: productId,
                                quantity: initialQuantity,
                                addedAt: Date.now(),
                                color: color,
                                name: productDetails.name,
                                price: productDetails.price,
                                image_url: productDetails.image_url,
                                stock_quantity: availableStock,
                            });
                        }
                    }

                    return { offlineItems: items };
                });
            },
            setOfflineItemQuantity: (productId, colorName, newQuantity) => {
                set((state) => {
                    const items = [...state.offlineItems];
                    const itemIndex = items.findIndex(
                        (item) =>
                            item.id === productId &&
                            item.color?.name === colorName,
                    );

                    if (itemIndex === -1) return state;

                    if (newQuantity <= 0) {
                        items.splice(itemIndex, 1);
                        return { offlineItems: items };
                    }

                    const currentItem = items[itemIndex];
                    const finalQuantity = Math.min(
                        newQuantity,
                        currentItem.stock_quantity,
                    );

                    items[itemIndex] = {
                        ...currentItem,
                        quantity: finalQuantity,
                        addedAt: Date.now(),
                    };
                    return { offlineItems: items };
                });
            },
            removeOfflineItem: (productId, colorName) => {
                set((state) => ({
                    offlineItems: state.offlineItems.filter(
                        (item) =>
                            !(item.id === productId &&
                                item.color?.name === colorName),
                    ),
                }));
            },
            clearOfflineCart: () => {
                set({ offlineItems: [] });
            },
            getOfflineCartCount: () => {
                return get().offlineItems.reduce(
                    (total, item) => total + item.quantity,
                    0,
                );
            },
            getOfflineItemQuantity: (productId, colorName) => {
                const item = get().offlineItems.find(
                    (i) => i.id === productId && i.color?.name === colorName,
                );
                return item?.quantity || 0;
            },
        }),
        {
            name: "offline-user-cart-v2",
            partialize: (state) => ({ offlineItems: state.offlineItems }),
        },
    ),
);

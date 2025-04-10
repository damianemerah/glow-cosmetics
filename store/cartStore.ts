import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define the cart item type
export interface OfflineCartItem {
    id: string;
    quantity: number;
    addedAt: number;
}

interface CartState {
    // State
    offlineItems: OfflineCartItem[];

    // Actions
    addOrUpdateOfflineItem: (productId: string, quantityChange: number) => void;
    setOfflineItemQuantity: (productId: string, newQuantity: number) => void;
    removeOfflineItem: (productId: string) => void;
    clearOfflineCart: () => void;

    // Selectors
    getOfflineCartCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // State
            offlineItems: [],

            // Actions
            addOrUpdateOfflineItem: (productId, quantityChange) => {
                set((state) => {
                    const existingItemIndex = state.offlineItems.findIndex(
                        (item) => item.id === productId,
                    );

                    const newItems = [...state.offlineItems];

                    if (existingItemIndex >= 0) {
                        // Item exists, update quantity
                        const currentQuantity =
                            newItems[existingItemIndex].quantity;
                        const newQuantity = currentQuantity + quantityChange;

                        if (newQuantity <= 0) {
                            // Remove item if quantity becomes zero or negative
                            newItems.splice(existingItemIndex, 1);
                        } else {
                            // Update the item with new quantity
                            newItems[existingItemIndex] = {
                                ...newItems[existingItemIndex],
                                quantity: newQuantity,
                                addedAt: Date.now(),
                            };
                        }
                    } else if (quantityChange > 0) {
                        // Item doesn't exist and we're adding a positive quantity
                        newItems.push({
                            id: productId,
                            quantity: quantityChange,
                            addedAt: Date.now(),
                        });
                    }

                    return { offlineItems: newItems };
                });
            },

            setOfflineItemQuantity: (productId, newQuantity) => {
                set((state) => {
                    if (newQuantity <= 0) {
                        // Remove item if quantity is zero or negative
                        return {
                            offlineItems: state.offlineItems.filter(
                                (item) => item.id !== productId,
                            ),
                        };
                    }

                    const existingItemIndex = state.offlineItems.findIndex(
                        (item) => item.id === productId,
                    );

                    if (existingItemIndex >= 0) {
                        // Item exists, update quantity
                        const newItems = [...state.offlineItems];
                        newItems[existingItemIndex] = {
                            ...newItems[existingItemIndex],
                            quantity: newQuantity,
                            addedAt: Date.now(),
                        };
                        return { offlineItems: newItems };
                    }

                    // Item doesn't exist, add it with the specified quantity
                    return {
                        offlineItems: [
                            ...state.offlineItems,
                            {
                                id: productId,
                                quantity: newQuantity,
                                addedAt: Date.now(),
                            },
                        ],
                    };
                });
            },

            removeOfflineItem: (productId) => {
                set((state) => ({
                    offlineItems: state.offlineItems.filter(
                        (item) => item.id !== productId,
                    ),
                }));
            },

            clearOfflineCart: () => {
                set({ offlineItems: [] });
            },

            // Selectors
            getOfflineCartCount: () => {
                return get().offlineItems.reduce(
                    (total, item) => total + item.quantity,
                    0,
                );
            },
        }),
        {
            name: "offlineUserCart", // localStorage key
            partialize: (state) => ({ offlineItems: state.offlineItems }), // Only persist the offlineItems
        },
    ),
);

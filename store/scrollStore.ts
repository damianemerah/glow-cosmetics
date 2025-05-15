import React from "react";
import { create } from "zustand";

interface ScrollStoreState {
    filtersElementRef: React.RefObject<HTMLDivElement | null> | null;
    setFiltersElementRef: (
        ref: React.RefObject<HTMLDivElement | null> | null,
    ) => void;
    clearFiltersElementRef: (
        refToClear: React.RefObject<HTMLDivElement | null>,
    ) => void;
    scrollToFilters: () => void;
}

export const useScrollStore = create<ScrollStoreState>((set, get) => ({
    filtersElementRef: null,
    setFiltersElementRef: (ref) => {
        set({ filtersElementRef: ref });
    },
    clearFiltersElementRef: (refToClear) => {
        if (get().filtersElementRef === refToClear) {
            set({ filtersElementRef: null });
        }
    },
    scrollToFilters: () => {
        const { filtersElementRef } = get();
        if (filtersElementRef?.current) {
            filtersElementRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        } else {
            console.warn("filtersElementRef or current is null");
        }
    },
}));

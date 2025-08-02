import { create } from "zustand";

interface UiStore {
    isSearchOpen: boolean;
    setIsSearchOpen: (isOpen: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
    isSearchOpen: false,
    setIsSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
}));

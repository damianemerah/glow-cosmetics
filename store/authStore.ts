// store/userStore.ts
import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import { Profile } from "@/types/index";

type UserStore = {
  user: { id: string } & Partial<Profile> | null;
  setUser: (user: { id: string } & Partial<Profile> | null) => void;
  fetchUser: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  shouldShowModal: boolean;
  setShowModal: (showModal: boolean) => void;
};

const supabase = createClient();

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  fetchUser: async (userId: string) => {
    const { data: userData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return;
    }

    set({ user: { id: userId, ...userData } });
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      set({ user: null });
    }
  },
  shouldShowModal: false,
  setShowModal: (showModal) => set({ shouldShowModal: showModal }),
}));

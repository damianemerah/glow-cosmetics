import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import { Profile } from "@/types/index";

type UserStateData = { id: string } & Partial<Profile>;

type UserStore = {
  user: UserStateData | null;
  setUser: (user: UserStateData | null) => void;
  fetchUser: (userId: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  shouldShowModal: boolean;
  setShowModal: (showModal: boolean) => void;
  isFetchingUser: boolean;
  refreshUserData: () => Promise<boolean>;
};

const supabase = createClient();

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isFetchingUser: false,
  setUser: (user) => set({ user, isFetchingUser: false }),

  fetchUser: async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    if (get().isFetchingUser || get().user?.id === userId) {
      return !!get().user;
    }

    set({ isFetchingUser: true });

    try {
      const { data: userData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        console.error(`Error fetching profile for ${userId}:`, error.message);
        set({ user: null, isFetchingUser: false });
        return false;
      }

      if (userData && userData.is_active) {
        set({ user: { id: userId, ...userData }, isFetchingUser: false });
        return true;
      } else if (userData && !userData.is_active) {
        console.warn(`Profile found for ${userId} but is inactive.`);
        set({ user: null, isFetchingUser: false });
        return false;
      } else {
        console.warn(
          `No active profile found for authenticated user ${userId}.`,
        );
        set({ user: null, isFetchingUser: false });
        return false;
      }
    } catch (e) {
      console.error("Unexpected error in fetchUser:", e);
      set({ user: null, isFetchingUser: false });
      return false;
    }
  },

  refreshUserData: async (): Promise<boolean> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth
        .getSession();

      if (sessionError || !session) {
        set({ user: null, isFetchingUser: false });
        return false;
      }

      return await get().fetchUser(session.user.id);
    } catch (e) {
      console.error("Error refreshing user data:", e);
      set({ user: null, isFetchingUser: false });
      return false;
    }
  },

  signOut: async () => {
    set({ isFetchingUser: true });
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      set({ isFetchingUser: false });
    } else {
      set({ user: null, isFetchingUser: false });
    }
  },

  shouldShowModal: false,
  setShowModal: (showModal) => set({ shouldShowModal: showModal }),
}));

import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import { Profile } from "@/types/index";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  message?: string;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export type UserStateData = { id: string } & Partial<Profile>;

type UserStore = {
  user: UserStateData | null;
  setUser: (user: UserStateData | null) => void;
  fetchUser: (userId: string) => Promise<boolean>;
  signOut: () => Promise<ActionResult>;
  shouldShowModal: boolean;
  setShowModal: (showModal: boolean) => void;
  isFetchingUser: boolean;
  refreshUserData: () => Promise<boolean>;
  needsProfileCompletion: () => boolean;
};

const supabase = createClient();

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isFetchingUser: false,
  setUser: (user) => set({ user, isFetchingUser: false }),

  needsProfileCompletion: () => {
    const user = get().user;
    if (!user) return false;

    return !(
      user.first_name &&
      user.last_name &&
      user.phone &&
      user.date_of_birth
    );
  },

  fetchUser: async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    if (get().user?.id === userId) return true; // Skip if already loaded

    try {
      set({ isFetchingUser: true });

      const { data: userData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (userData?.is_active) {
        set({ user: { id: userId, ...userData }, isFetchingUser: false });
        return true;
      }

      set({ user: null, isFetchingUser: false });
      return false;
    } catch (error) {
      console.error("Fetch user error:", error);
      set({ user: null, isFetchingUser: false });
      return false;
    }
  },
  refreshUserData: async (): Promise<boolean> => {
    try {
      set({ isFetchingUser: true });
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

  signOut: async (): Promise<ActionResult> => {
    try {
      set({ isFetchingUser: true });
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error signing out:", error.message);
        set({ isFetchingUser: false });
        return {
          success: false,
          error: error.message,
          errorCode: "SIGNOUT_ERROR",
        };
      }

      set({ user: null, isFetchingUser: false });
      return { success: true };
    } catch (e) {
      const error = e as Error;
      console.error("Unexpected error in signOut:", error);
      set({ isFetchingUser: false });
      return {
        success: false,
        error: error.message || "An unexpected error occurred during sign out",
        errorCode: "UNKNOWN_ERROR",
      };
    }
  },

  shouldShowModal: false,
  setShowModal: (showModal) => set({ shouldShowModal: showModal }),
}));

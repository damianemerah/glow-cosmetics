import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import { Profile } from "@/types/index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}
// eslint-enable-next-line @typescript-eslint/no-explicit-any

type UserStateData = { id: string } & Partial<Profile>;

type UserStore = {
  user: UserStateData | null;
  setUser: (user: UserStateData | null) => void;
  fetchUser: (userId: string) => Promise<boolean>;
  signOut: () => Promise<ActionResult>;
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

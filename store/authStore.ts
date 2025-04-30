// store/authStore.ts
import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import { Profile } from "@/types/index"; // Assuming Profile includes is_active

type UserStateData = { id: string } & Partial<Profile>; // Type for the user state

type UserStore = {
  user: UserStateData | null;
  setUser: (user: UserStateData | null) => void;
  fetchUser: (userId: string) => Promise<boolean>; // Return boolean success indicator
  signOut: () => Promise<void>;
  shouldShowModal: boolean;
  setShowModal: (showModal: boolean) => void;
  isFetchingUser: boolean; // Add loading state
};

const supabase = createClient();

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isFetchingUser: false, // Initialize loading state
  setUser: (user) => set({ user, isFetchingUser: false }), // Stop loading when setting user

  fetchUser: async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    // Prevent fetching if already fetching or if user is already set with this ID
    if (get().isFetchingUser || get().user?.id === userId) {
      // console.log("Fetch user skipped - already fetching or user already set.");
      return !!get().user; // Return true if user already exists
    }

    // console.log(`Fetching profile for user ID: ${userId}`); // Debug log
    set({ isFetchingUser: true }); // Set loading true

    try {
      const { data: userData, error } = await supabase
        .from("profiles")
        .select("*") // Select all profile fields
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle to handle not found gracefully

      if (error) {
        console.error(`Error fetching profile for ${userId}:`, error.message);
        set({ user: null, isFetchingUser: false }); // Set user to null on fetch error
        return false;
      }

      if (userData && userData.is_active) {
        // console.log(`Profile found and active for ${userId}:`, userData); // Debug log
        set({ user: { id: userId, ...userData }, isFetchingUser: false });
        return true;
      } else if (userData && !userData.is_active) {
        console.warn(`Profile found for ${userId} but is inactive.`);
        // Decide how to handle inactive users - treat as logged out?
        set({ user: null, isFetchingUser: false }); // Treat inactive as not logged in for UI
        // Optionally sign them out from Supabase Auth too
        // await supabase.auth.signOut();
        return false;
      } else {
        console.warn(
          `No active profile found for authenticated user ${userId}.`,
        );
        // Profile doesn't exist or isn't active, keep user state null
        set({ user: null, isFetchingUser: false });
        return false;
      }
    } catch (e) {
      // Catch any unexpected errors during fetch
      console.error("Unexpected error in fetchUser:", e);
      set({ user: null, isFetchingUser: false });
      return false;
    }
  },

  signOut: async () => {
    set({ isFetchingUser: true }); // Indicate activity
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      set({ isFetchingUser: false }); // Stop loading even on error
    } else {
      // console.log("Sign out successful."); // Debug log
      set({ user: null, isFetchingUser: false }); // Clear user state
    }
  },

  shouldShowModal: false,
  setShowModal: (showModal) => set({ shouldShowModal: showModal }),
}));

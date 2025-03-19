import { create } from "zustand";
import { fetchTodayBookings } from "@/actions/bookingAction";

interface BookingStoreState {
  bookedSlots: Map<string, Date[]>; // Map of date string to booked slot dates
  isLoading: boolean;
  fetchSlotsForDate: (date: Date) => Promise<void>;
}

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  bookedSlots: new Map(),
  isLoading: false,

  fetchSlotsForDate: async (date: Date) => {
    try {
      const dateKey = date.toDateString();

      // Check if we already have the data for this date
      if (get().bookedSlots.has(dateKey)) {
        return;
      }

      set({ isLoading: true });

      // Fetch booked slots for the specified date
      const bookedSlots = await fetchTodayBookings(date);

      // Update the map with the new data
      const updatedSlots = new Map(get().bookedSlots);
      updatedSlots.set(dateKey, bookedSlots);

      set({
        bookedSlots: updatedSlots,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      set({ isLoading: false });
    }
  },
}));

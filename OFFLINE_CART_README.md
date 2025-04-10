# Offline Cart Implementation

This implementation allows users to add items to their cart even when offline or not logged in, with the cart being stored in localStorage. When a user logs in, their offline cart is automatically merged with their server-side cart.

## Features

- Add products to cart when offline or not logged in
- Display offline cart items in the cart pane
- Automatically sync offline cart with server cart on login
- Show offline status in the UI with appropriate messaging
- Handle errors gracefully with toast notifications

## Components Implemented

1. **Offline Cart Utilities (`lib/localCart.ts`)**

   - `getOfflineCart()`: Safely reads cart from localStorage
   - `setOfflineCart()`: Safely saves cart to localStorage
   - `addOrUpdateItemOffline()`: Adds or updates items in offline cart
   - `clearOfflineCart()`: Removes cart from localStorage
   - `getOfflineCartCount()`: Gets the total number of items in offline cart

2. **Server Actions**

   - `mergeOfflineCart()`: Merges offline cart with server cart on login
   - `getProductsByIds()`: Fetches product details for offline cart items

3. **UI Components**

   - Updated Navbar to show offline cart count
   - Updated CartPane to display offline cart items
   - Added offline indicators and messaging

4. **Database Migrations**
   - Added timestamp functions and triggers
   - Added timestamp columns to relevant tables
   - Modified cart table constraints for better data integrity

## Database Schema Updates

- Added `created_at` and `updated_at` columns to all relevant tables
- Created `handle_created_at()` and `handle_updated_at()` functions
- Added triggers to automatically update timestamps
- Added a unique constraint on `user_id` in the `carts` table to ensure one cart per user

## How to Use

1. **For Users**

   - Add products to cart while offline or not logged in
   - Items are stored locally in browser storage
   - Upon login, offline cart is automatically merged with server cart
   - After successful merge, the offline cart is cleared

2. **For Developers**
   - The implementation dispatches a custom event `offlineCartUpdated` when the offline cart changes
   - UI components listen for this event to update accordingly
   - The merge strategy adds quantities for existing items

## Testing

To test the offline functionality:

1. Turn off your internet connection or use browser devtools to simulate offline mode
2. Add items to cart
3. Verify they appear in the cart pane with offline indicator
4. Turn on your internet connection and log in
5. Verify the items are merged with your server cart

## Applying Database Migrations

To apply the database migrations:

```bash
# Using Supabase CLI
npx supabase migration up

# Or using the convenience script
node scripts/apply-migration.mjs
```

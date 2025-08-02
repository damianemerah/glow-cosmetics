import { Database } from "./supabase";

type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];
type DbBooking = Database["public"]["Tables"]["bookings"]["Row"];
type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbCart = Database["public"]["Tables"]["carts"]["Row"];
type DbCartItem = Database["public"]["Tables"]["cart_items"]["Row"];
type DbOrder = Database["public"]["Tables"]["orders"]["Row"];
type DbOrderItem = Database["public"]["Tables"]["order_items"]["Row"];
type DBCategory = Database["public"]["Tables"]["categories"]["Row"];
type DBWishlist = Database["public"]["Tables"]["wishlists"]["Row"];

export type Profile = DbProfile;

// Export paymentMethod type
export type PaymentMethodType = "bank_transfer" | "paystack";

export type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
};

export type Order = Omit<DbOrder, "shipping_address"> & {
  shipping_address: ShippingAddress | null;
  items: DbOrderItem[];
};

export type CheckoutCartItem = {
  id: string;
  quantity: number;
  price_at_time: number;
  product_id: string;
  color: ColorInfo | null;
  products: {
    name: string;
    image_url?: string[] | null;
  } | null;
};

export interface OrderInputData {
  userId: string;
  cartId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingAddress: { // Define structure clearly
    address: string;
    apartment?: string; // Optional
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryMethod: string;
  deliveryFee: number;
  paymentMethod: PaymentMethodType;
  totalAmount: number; // Total including delivery
  emailOffers: boolean; // Whether user opted in
  cartItems: Array<
    Pick<
      CheckoutCartItem,
      "id" | "product_id" | "quantity" | "price_at_time" | "color"
    > & { product_name: string }
  >; // Data needed to create order_items
}

export type OrderItem = DbOrderItem;

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking extends DbBooking {
  duration: string; // interval stored as string
  location: string | null;
}

export type Product = DbProduct;

export type Category = DBCategory;

export interface ColorInfo {
  name: string;
  hex: string;
  [key: string]: string;
}

export interface ProductWithCategories extends Product {
  categoryIds?: string[];
  product_categories: {
    category_id: string;
    categories?: Category;
  }[];
}

export type ProductFormData =
  & Omit<Product, "id" | "created_at" | "updated_at">
  & {
    categoryIds?: string[];
  };

export interface AdditionalDetailItem {
  key: string;
  value: string;
}

export type ProductAdditionalDetails = AdditionalDetailItem[];

export type ProductCategory =
  | "lip_gloss"
  | "skin_care"
  | "supplements"
  | "jewellery"
  | "makeup";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  slug: string;
  image: string;
  videoUrl?: string;
  details: string;
}

export type Cart = DbCart;

export type CartProduct = Pick<
  Product,
  "id" | "name" | "price" | "image_url" | "color"
>;

export type CartItemInputData = {
  id: string;
  name: string;
  price: number;
  image_url?: string[] | null;
  color?: ColorInfo | null;
};

export interface CartItem extends DbCartItem {
  product: CartItemInputData;
}

export interface BeautyTip {
  title: string;
  description: string;
  icon: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  totalSpent: string;
}

export interface Wishlist extends DBWishlist {
  products?: Pick<
    Product,
    | "id"
    | "name"
    | "price"
    | "image_url"
    | "slug"
    | "stock_quantity"
    | "is_bestseller"
    | "compare_price"
  >;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at?: string;
  products: Pick<
    Product,
    | "id"
    | "name"
    | "price"
    | "image_url"
    | "slug"
    | "stock_quantity"
    | "is_bestseller"
    | "compare_price"
  >;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string; // We'll need a slug for navigation
  description: string;
  price?: number; // Optional if not always displayed
  image?: string; // Optional
  details?: string; // Optional
  category?: string; // To group services, e.g., "makeup", "skincare"
}

// A top-level category type that can represent either
export interface UnifiedCategory {
  id: string;
  name: string;
  slug: string;
  type: "product" | "service" | "product-group";
  children?: UnifiedCategory[];
  parent_slug?: string; // For constructing URLs for product subcategories
  pinned?: boolean;
}

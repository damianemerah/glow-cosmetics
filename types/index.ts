import { Database } from "./types";

type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];
type DbBooking = Database["public"]["Tables"]["bookings"]["Row"];
type DbProduct = Database["public"]["Tables"]["products"]["Row"];
type DbCart = Database["public"]["Tables"]["carts"]["Row"];
type DbCartItem = Database["public"]["Tables"]["cart_items"]["Row"];
type DbOrder = Database["public"]["Tables"]["orders"]["Row"];
type DbOrderItem = Database["public"]["Tables"]["order_items"]["Row"];
type DBCategory = Database["public"]["Tables"]["categories"]["Row"];

export type Profile = DbProfile;

export type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
};
export type Order = Omit<DbOrder, "shipping_address"> & {
  shipping_address: ShippingAddress | null;
  items: DbOrderItem[]; // Extend items which is DbOrderItem
};

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
  category: "makeup" | "consultation" | "skincare";
  image: string;
  details: string;
}

export type Cart = DbCart;

export type CartProduct = Pick<Product, "id" | "name" | "price" | "image_url">;

type SimpleProduct = Pick<DbProduct, "id" | "name" | "price" | "image_url">;

export interface CartItem extends DbCartItem {
  product: SimpleProduct;
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

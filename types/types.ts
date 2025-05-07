export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            audit_logs: {
                Row: {
                    action: string | null;
                    created_at: string | null;
                    id: string;
                    new_data: Json | null;
                    old_data: Json | null;
                    table_name: string | null;
                    user_id: string | null;
                };
                Insert: {
                    action?: string | null;
                    created_at?: string | null;
                    id?: string;
                    new_data?: Json | null;
                    old_data?: Json | null;
                    table_name?: string | null;
                    user_id?: string | null;
                };
                Update: {
                    action?: string | null;
                    created_at?: string | null;
                    id?: string;
                    new_data?: Json | null;
                    old_data?: Json | null;
                    table_name?: string | null;
                    user_id?: string | null;
                };
                Relationships: [];
            };
            bookings: {
                Row: {
                    booking_id: string;
                    booking_time: string;
                    created_at: string | null;
                    duration: unknown | null;
                    email: string | null;
                    first_name: string;
                    id: string;
                    initial_deposit: number | null;
                    last_name: string;
                    phone: string;
                    sent_confirmation: boolean;
                    sent_thanks: boolean;
                    service_id: string | null;
                    service_name: string;
                    service_price: number;
                    special_requests: string | null;
                    status: string;
                    updated_at: string | null;
                    user_id: string | null;
                };
                Insert: {
                    booking_id: string;
                    booking_time: string;
                    created_at?: string | null;
                    duration?: unknown | null;
                    email?: string | null;
                    first_name: string;
                    id?: string;
                    initial_deposit?: number | null;
                    last_name: string;
                    phone: string;
                    sent_confirmation?: boolean;
                    sent_thanks?: boolean;
                    service_id?: string | null;
                    service_name: string;
                    service_price: number;
                    special_requests?: string | null;
                    status?: string;
                    updated_at?: string | null;
                    user_id?: string | null;
                };
                Update: {
                    booking_id?: string;
                    booking_time?: string;
                    created_at?: string | null;
                    duration?: unknown | null;
                    email?: string | null;
                    first_name?: string;
                    id?: string;
                    initial_deposit?: number | null;
                    last_name?: string;
                    phone?: string;
                    sent_confirmation?: boolean;
                    sent_thanks?: boolean;
                    service_id?: string | null;
                    service_name?: string;
                    service_price?: number;
                    special_requests?: string | null;
                    status?: string;
                    updated_at?: string | null;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "bookings_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
            cart_items: {
                Row: {
                    cart_id: string | null;
                    color: string | null;
                    created_at: string | null;
                    id: string;
                    price_at_time: number;
                    product_id: string;
                    quantity: number;
                    subtotal: number | null;
                    updated_at: string;
                };
                Insert: {
                    cart_id?: string | null;
                    color?: string | null;
                    created_at?: string | null;
                    id?: string;
                    price_at_time: number;
                    product_id: string;
                    quantity?: number;
                    subtotal?: number | null;
                    updated_at?: string;
                };
                Update: {
                    cart_id?: string | null;
                    color?: string | null;
                    created_at?: string | null;
                    id?: string;
                    price_at_time?: number;
                    product_id?: string;
                    quantity?: number;
                    subtotal?: number | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "cart_items_cart_id_fkey";
                        columns: ["cart_id"];
                        isOneToOne: false;
                        referencedRelation: "carts";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "cart_items_product_id_fkey";
                        columns: ["product_id"];
                        isOneToOne: false;
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    },
                ];
            };
            carts: {
                Row: {
                    created_at: string | null;
                    id: string;
                    total_price: number | null;
                    updated_at: string;
                    user_id: string | null;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    total_price?: number | null;
                    updated_at?: string;
                    user_id?: string | null;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    total_price?: number | null;
                    updated_at?: string;
                    user_id?: string | null;
                };
                Relationships: [];
            };
            categories: {
                Row: {
                    created_at: string;
                    id: string;
                    images: string[] | null;
                    name: string;
                    parent_id: string | null;
                    pinned: boolean;
                    search_vector: unknown | null;
                    slug: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    images?: string[] | null;
                    name: string;
                    parent_id?: string | null;
                    pinned?: boolean;
                    search_vector?: unknown | null;
                    slug: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    images?: string[] | null;
                    name?: string;
                    parent_id?: string | null;
                    pinned?: boolean;
                    search_vector?: unknown | null;
                    slug?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "categories_parent_id_fkey";
                        columns: ["parent_id"];
                        isOneToOne: false;
                        referencedRelation: "categories";
                        referencedColumns: ["id"];
                    },
                ];
            };
            message_logs: {
                Row: {
                    channel: string;
                    created_at: string;
                    id: number;
                    message: string;
                    message_id: string | null;
                    recipients: string;
                    resent_from: string | null;
                    status: string;
                    subject: string | null;
                    updated_at: string;
                    user_id: string | null;
                };
                Insert: {
                    channel: string;
                    created_at?: string;
                    id?: number;
                    message: string;
                    message_id?: string | null;
                    recipients: string;
                    resent_from?: string | null;
                    status?: string;
                    subject?: string | null;
                    updated_at?: string;
                    user_id?: string | null;
                };
                Update: {
                    channel?: string;
                    created_at?: string;
                    id?: number;
                    message?: string;
                    message_id?: string | null;
                    recipients?: string;
                    resent_from?: string | null;
                    status?: string;
                    subject?: string | null;
                    updated_at?: string;
                    user_id?: string | null;
                };
                Relationships: [];
            };
            order_items: {
                Row: {
                    color: string | null;
                    created_at: string | null;
                    id: string;
                    order_id: string;
                    price_at_time: number;
                    product_id: string;
                    product_name: string;
                    quantity: number;
                    updated_at: string;
                };
                Insert: {
                    color?: string | null;
                    created_at?: string | null;
                    id?: string;
                    order_id: string;
                    price_at_time: number;
                    product_id: string;
                    product_name: string;
                    quantity?: number;
                    updated_at?: string;
                };
                Update: {
                    color?: string | null;
                    created_at?: string | null;
                    id?: string;
                    order_id?: string;
                    price_at_time?: number;
                    product_id?: string;
                    product_name?: string;
                    quantity?: number;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "order_items_order_id_fkey";
                        columns: ["order_id"];
                        isOneToOne: false;
                        referencedRelation: "orders";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "order_items_product_id_fkey";
                        columns: ["product_id"];
                        isOneToOne: false;
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    },
                ];
            };
            orders: {
                Row: {
                    cart_id: string | null;
                    created_at: string;
                    delivery_method: string;
                    email: string;
                    first_name: string;
                    id: string;
                    last_name: string | null;
                    payment_method: string;
                    payment_reference: string;
                    phone: string;
                    shipping_address: Json | null;
                    status: string | null;
                    total_price: number;
                    updated_at: string | null;
                    user_id: string | null;
                };
                Insert: {
                    cart_id?: string | null;
                    created_at?: string;
                    delivery_method?: string;
                    email: string;
                    first_name: string;
                    id?: string;
                    last_name?: string | null;
                    payment_method: string;
                    payment_reference: string;
                    phone: string;
                    shipping_address?: Json | null;
                    status?: string | null;
                    total_price: number;
                    updated_at?: string | null;
                    user_id?: string | null;
                };
                Update: {
                    cart_id?: string | null;
                    created_at?: string;
                    delivery_method?: string;
                    email?: string;
                    first_name?: string;
                    id?: string;
                    last_name?: string | null;
                    payment_method?: string;
                    payment_reference?: string;
                    phone?: string;
                    shipping_address?: Json | null;
                    status?: string | null;
                    total_price?: number;
                    updated_at?: string | null;
                    user_id?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: "orders_cart_id_fkey";
                        columns: ["cart_id"];
                        isOneToOne: false;
                        referencedRelation: "carts";
                        referencedColumns: ["id"];
                    },
                ];
            };
            payments: {
                Row: {
                    amount: number | null;
                    created_at: string | null;
                    id: string;
                    order_id: string | null;
                    payment_method: string | null;
                    status: string | null;
                    transaction_id: string | null;
                };
                Insert: {
                    amount?: number | null;
                    created_at?: string | null;
                    id?: string;
                    order_id?: string | null;
                    payment_method?: string | null;
                    status?: string | null;
                    transaction_id?: string | null;
                };
                Update: {
                    amount?: number | null;
                    created_at?: string | null;
                    id?: string;
                    order_id?: string | null;
                    payment_method?: string | null;
                    status?: string | null;
                    transaction_id?: string | null;
                };
                Relationships: [];
            };
            product_categories: {
                Row: {
                    category_id: string;
                    product_id: string;
                };
                Insert: {
                    category_id: string;
                    product_id: string;
                };
                Update: {
                    category_id?: string;
                    product_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "product_categories_category_id_fkey";
                        columns: ["category_id"];
                        isOneToOne: false;
                        referencedRelation: "categories";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "product_categories_product_id_fkey";
                        columns: ["product_id"];
                        isOneToOne: false;
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    },
                ];
            };
            products: {
                Row: {
                    additional_details: Json | null;
                    color: Json[] | null;
                    compare_price: number | null;
                    created_at: string | null;
                    description: string | null;
                    id: string;
                    image_url: string[];
                    is_active: boolean;
                    is_bestseller: boolean;
                    name: string;
                    price: number;
                    search_vector: unknown | null;
                    short_description: string;
                    slug: string;
                    stock_quantity: number;
                    updated_at: string;
                };
                Insert: {
                    additional_details?: Json | null;
                    color?: Json[] | null;
                    compare_price?: number | null;
                    created_at?: string | null;
                    description?: string | null;
                    id?: string;
                    image_url: string[];
                    is_active?: boolean;
                    is_bestseller?: boolean;
                    name: string;
                    price: number;
                    search_vector?: unknown | null;
                    short_description: string;
                    slug: string;
                    stock_quantity?: number;
                    updated_at?: string;
                };
                Update: {
                    additional_details?: Json | null;
                    color?: Json[] | null;
                    compare_price?: number | null;
                    created_at?: string | null;
                    description?: string | null;
                    id?: string;
                    image_url?: string[];
                    is_active?: boolean;
                    is_bestseller?: boolean;
                    name?: string;
                    price?: number;
                    search_vector?: unknown | null;
                    short_description?: string;
                    slug?: string;
                    stock_quantity?: number;
                    updated_at?: string;
                };
                Relationships: [];
            };
            profiles: {
                Row: {
                    appointment_reminder: boolean;
                    avatar: string | null;
                    birthday_notification_enabled: boolean;
                    created_at: string | null;
                    date_of_birth: string | null;
                    email: string;
                    email_notifications_enabled: boolean;
                    first_name: string | null;
                    full_name: string | null;
                    is_active: boolean | null;
                    is_complete: boolean | null;
                    last_name: string | null;
                    last_purchase_date: string | null;
                    phone: string | null;
                    receive_emails: boolean;
                    role: string;
                    updated_at: string | null;
                    user_id: string;
                    whatsapp_notifications_enabled: boolean;
                };
                Insert: {
                    appointment_reminder?: boolean;
                    avatar?: string | null;
                    birthday_notification_enabled?: boolean;
                    created_at?: string | null;
                    date_of_birth?: string | null;
                    email: string;
                    email_notifications_enabled?: boolean;
                    first_name?: string | null;
                    full_name?: string | null;
                    is_active?: boolean | null;
                    is_complete?: boolean | null;
                    last_name?: string | null;
                    last_purchase_date?: string | null;
                    phone?: string | null;
                    receive_emails?: boolean;
                    role?: string;
                    updated_at?: string | null;
                    user_id: string;
                    whatsapp_notifications_enabled?: boolean;
                };
                Update: {
                    appointment_reminder?: boolean;
                    avatar?: string | null;
                    birthday_notification_enabled?: boolean;
                    created_at?: string | null;
                    date_of_birth?: string | null;
                    email?: string;
                    email_notifications_enabled?: boolean;
                    first_name?: string | null;
                    full_name?: string | null;
                    is_active?: boolean | null;
                    is_complete?: boolean | null;
                    last_name?: string | null;
                    last_purchase_date?: string | null;
                    phone?: string | null;
                    receive_emails?: boolean;
                    role?: string;
                    updated_at?: string | null;
                    user_id?: string;
                    whatsapp_notifications_enabled?: boolean;
                };
                Relationships: [];
            };
            wishlists: {
                Row: {
                    created_at: string | null;
                    id: string;
                    product_id: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: string;
                    product_id: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: string;
                    product_id?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "wishlists_product_id_fkey";
                        columns: ["product_id"];
                        isOneToOne: false;
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "wishlists_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "profiles";
                        referencedColumns: ["user_id"];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            get_random_products: {
                Args: { count: number };
                Returns: Json[];
            };
            get_user_id_by_email: {
                Args: { p_email: string };
                Returns: string;
            };
            gtrgm_compress: {
                Args: { "": unknown };
                Returns: unknown;
            };
            gtrgm_decompress: {
                Args: { "": unknown };
                Returns: unknown;
            };
            gtrgm_in: {
                Args: { "": unknown };
                Returns: unknown;
            };
            gtrgm_options: {
                Args: { "": unknown };
                Returns: undefined;
            };
            gtrgm_out: {
                Args: { "": unknown };
                Returns: unknown;
            };
            merge_add_cart_item: {
                Args: {
                    p_cart_id: string;
                    p_product_id: string;
                    p_quantity_to_add: number;
                    p_price_at_time: number;
                };
                Returns: boolean;
            };
            search_items: {
                Args: { term: string; limit_count: number };
                Returns: {
                    id: string;
                    name: string;
                    item_type: string;
                }[];
            };
            set_limit: {
                Args: { "": number };
                Returns: number;
            };
            show_limit: {
                Args: Record<PropertyKey, never>;
                Returns: number;
            };
            show_trgm: {
                Args: { "": string };
                Returns: string[];
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
    DefaultSchemaTableNameOrOptions extends
        | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    } ? keyof (
            & Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
            & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"]
        )
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database } ? (
        & Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"]
    )[TableName] extends {
        Row: infer R;
    } ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (
        & DefaultSchema["Tables"]
        & DefaultSchema["Views"]
    ) ? (
            & DefaultSchema["Tables"]
            & DefaultSchema["Views"]
        )[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R;
        } ? R
        : never
    : never;

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    } ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][
        TableName
    ] extends {
        Insert: infer I;
    } ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
        ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Insert: infer I;
        } ? I
        : never
    : never;

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
        | keyof DefaultSchema["Tables"]
        | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof Database;
    } ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][
        TableName
    ] extends {
        Update: infer U;
    } ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
        ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
            Update: infer U;
        } ? U
        : never
    : never;

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
        | keyof DefaultSchema["Enums"]
        | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database;
    } ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
        ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof DefaultSchema["CompositeTypes"]
        | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database;
    }
        ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]][
            "CompositeTypes"
        ]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][
        CompositeTypeName
    ]
    : PublicCompositeTypeNameOrOptions extends
        keyof DefaultSchema["CompositeTypes"]
        ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
    public: {
        Enums: {},
    },
} as const;

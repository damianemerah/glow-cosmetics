export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
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
          email: string;
          first_name: string;
          id: string;
          initial_deposit: number | null;
          last_name: string;
          phone: string;
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
          email: string;
          first_name: string;
          id?: string;
          initial_deposit?: number | null;
          last_name: string;
          phone: string;
          service_id?: string | null;
          service_name: string;
          service_price: number;
          special_requests?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          booking_id?: string;
          booking_time?: string;
          created_at?: string | null;
          duration?: unknown | null;
          email?: string;
          first_name?: string;
          id?: string;
          initial_deposit?: number | null;
          last_name?: string;
          phone?: string;
          service_id?: string | null;
          service_name?: string;
          service_price?: number;
          special_requests?: string | null;
          status?: string | null;
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
      order_items: {
        Row: {
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
          created_at: string | null;
          email: string;
          first_name: string;
          id: string;
          last_name: string | null;
          payment_method: string;
          payment_reference: string;
          phone: string | null;
          shipping_address: Json | null;
          status: string | null;
          total_price: number;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          cart_id?: string | null;
          created_at?: string | null;
          email: string;
          first_name: string;
          id?: string;
          last_name?: string | null;
          payment_method: string;
          payment_reference: string;
          phone?: string | null;
          shipping_address?: Json | null;
          status?: string | null;
          total_price: number;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          cart_id?: string | null;
          created_at?: string | null;
          email?: string;
          first_name?: string;
          id?: string;
          last_name?: string | null;
          payment_method?: string;
          payment_reference?: string;
          phone?: string | null;
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
      products: {
        Row: {
          category: string;
          created_at: string | null;
          description: string | null;
          id: string;
          image_url: string[];
          is_active: boolean;
          is_bestseller: boolean;
          name: string;
          price: number;
          short_description: string;
          slug: string;
          stock_quantity: number;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string[] | null;
          is_active?: boolean;
          is_bestseller?: boolean;
          name: string;
          price: number;
          short_description: string;
          slug: string;
          stock_quantity?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          image_url?: string[] | null;
          is_active?: boolean;
          is_bestseller?: boolean;
          name?: string;
          price?: number;
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
          phone: string | null;
          receive_emails: boolean | null;
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
          phone?: string | null;
          receive_emails?: boolean | null;
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
          phone?: string | null;
          receive_emails?: boolean | null;
          role?: string;
          updated_at?: string | null;
          user_id?: string;
          whatsapp_notifications_enabled?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_id_by_email: {
        Args: { p_email: string };
        Returns: string;
      };
      update_inventory_after_purchase: {
        Args: { order_id: string };
        Returns: boolean;
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
  } ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]][
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;

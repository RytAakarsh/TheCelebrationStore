export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          area: string | null
          city: string
          created_at: string
          full_name: string
          house: string | null
          id: string
          is_default: boolean
          landmark: string | null
          phone: string
          pincode: string
          state: string
          street: string | null
          user_id: string
        }
        Insert: {
          area?: string | null
          city: string
          created_at?: string
          full_name: string
          house?: string | null
          id?: string
          is_default?: boolean
          landmark?: string | null
          phone: string
          pincode: string
          state: string
          street?: string | null
          user_id: string
        }
        Update: {
          area?: string | null
          city?: string
          created_at?: string
          full_name?: string
          house?: string | null
          id?: string
          is_default?: boolean
          landmark?: string | null
          phone?: string
          pincode?: string
          state?: string
          street?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          accent: string | null
          banner_url: string | null
          created_at: string
          description: string | null
          display_order: number
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          accent?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          accent?: string | null
          banner_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          min_cart_value: number
          per_user_limit: number | null
          starts_at: string | null
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_cart_value?: number
          per_user_limit?: number | null
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_cart_value?: number
          per_user_limit?: number | null
          starts_at?: string | null
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          created_at: string
          cta_link: string | null
          cta_text: string | null
          desktop_image_url: string | null
          display_order: number
          ends_at: string | null
          heading: string | null
          id: string
          is_active: boolean
          mobile_image_url: string | null
          starts_at: string | null
          subheading: string | null
        }
        Insert: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          desktop_image_url?: string | null
          display_order?: number
          ends_at?: string | null
          heading?: string | null
          id?: string
          is_active?: boolean
          mobile_image_url?: string | null
          starts_at?: string | null
          subheading?: string | null
        }
        Update: {
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          desktop_image_url?: string | null
          display_order?: number
          ends_at?: string | null
          heading?: string | null
          id?: string
          is_active?: boolean
          mobile_image_url?: string | null
          starts_at?: string | null
          subheading?: string | null
        }
        Relationships: []
      }
      home_sections: {
        Row: {
          category_id: string | null
          display_order: number
          id: string
          is_active: boolean
          key: string
          source: string
          subtitle: string | null
          title: string
        }
        Insert: {
          category_id?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          key: string
          source?: string
          subtitle?: string | null
          title: string
        }
        Update: {
          category_id?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          key?: string
          source?: string
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_sections_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_products: {
        Row: {
          id: string
          offer_id: string
          product_id: string
        }
        Insert: {
          id?: string
          offer_id: string
          product_id: string
        }
        Update: {
          id?: string
          offer_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_products_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          banner_url: string | null
          created_at: string
          discount_type: string
          discount_value: number
          display_order: number
          ends_at: string | null
          id: string
          is_active: boolean
          name: string
          starts_at: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          discount_type?: string
          discount_value?: number
          display_order?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          starts_at?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          discount_type?: string
          discount_value?: number
          display_order?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          starts_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          image_url: string | null
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
          total: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          id?: string
          image_url?: string | null
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
          total: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          id?: string
          image_url?: string | null
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
          total?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: Json
          coupon_code: string | null
          created_at: string
          customer_name: string
          discount: number
          email: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string
          payment_ref: string | null
          payment_status: string
          phone: string
          shipping: number
          status: string
          subtotal: number
          tax: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: Json
          coupon_code?: string | null
          created_at?: string
          customer_name: string
          discount?: number
          email?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_ref?: string | null
          payment_status?: string
          phone: string
          shipping?: number
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: Json
          coupon_code?: string | null
          created_at?: string
          customer_name?: string
          discount?: number
          email?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string
          payment_ref?: string | null
          payment_status?: string
          phone?: string
          shipping?: number
          status?: string
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt: string | null
          id: string
          is_primary: boolean
          position: number
          product_id: string
          url: string
        }
        Insert: {
          alt?: string | null
          id?: string
          is_primary?: boolean
          position?: number
          product_id: string
          url: string
        }
        Update: {
          alt?: string | null
          id?: string
          is_primary?: boolean
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color_hex: string | null
          color_name: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          moq: number
          mrp: number | null
          name: string
          position: number
          price: number | null
          product_id: string
          sku: string | null
          stock: number
        }
        Insert: {
          color_hex?: string | null
          color_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          moq?: number
          mrp?: number | null
          name: string
          position?: number
          price?: number | null
          product_id: string
          sku?: string | null
          stock?: number
        }
        Update: {
          color_hex?: string | null
          color_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          moq?: number
          mrp?: number | null
          name?: string
          position?: number
          price?: number | null
          product_id?: string
          sku?: string | null
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_backorder: boolean
          brand: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_archived: boolean
          is_bestseller: boolean
          is_featured: boolean
          is_new: boolean
          is_published: boolean
          is_trending: boolean
          low_stock_threshold: number
          moq: number
          mrp: number
          name: string
          price: number
          rating: number
          review_count: number
          short_description: string | null
          sku: string | null
          slug: string
          sold_count: number
          stock: number
          subcategory_id: string | null
          tags: string[]
          track_inventory: boolean
          updated_at: string
        }
        Insert: {
          allow_backorder?: boolean
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_published?: boolean
          is_trending?: boolean
          low_stock_threshold?: number
          moq?: number
          mrp?: number
          name: string
          price?: number
          rating?: number
          review_count?: number
          short_description?: string | null
          sku?: string | null
          slug: string
          sold_count?: number
          stock?: number
          subcategory_id?: string | null
          tags?: string[]
          track_inventory?: boolean
          updated_at?: string
        }
        Update: {
          allow_backorder?: boolean
          brand?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          is_new?: boolean
          is_published?: boolean
          is_trending?: boolean
          low_stock_threshold?: number
          moq?: number
          mrp?: number
          name?: string
          price?: number
          rating?: number
          review_count?: number
          short_description?: string | null
          sku?: string | null
          slug?: string
          sold_count?: number
          stock?: number
          subcategory_id?: string | null
          tags?: string[]
          track_inventory?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_login_at: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_login_at?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          image_url: string | null
          is_approved: boolean
          product_id: string
          rating: number
          title: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          product_id: string
          rating: number
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_approved?: boolean
          product_id?: string
          rating?: number
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string
          brand_name: string
          cod_enabled: boolean
          email: string
          facebook_url: string | null
          free_shipping_threshold: number
          id: number
          instagram_url: string | null
          logo_url: string | null
          online_payment_enabled: boolean
          phone: string
          seo_description: string | null
          seo_title: string | null
          shipping_charge: number
          tagline: string
          updated_at: string
          whatsapp: string
          youtube_url: string | null
        }
        Insert: {
          address?: string
          brand_name?: string
          cod_enabled?: boolean
          email?: string
          facebook_url?: string | null
          free_shipping_threshold?: number
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          online_payment_enabled?: boolean
          phone?: string
          seo_description?: string | null
          seo_title?: string | null
          shipping_charge?: number
          tagline?: string
          updated_at?: string
          whatsapp?: string
          youtube_url?: string | null
        }
        Update: {
          address?: string
          brand_name?: string
          cod_enabled?: boolean
          email?: string
          facebook_url?: string | null
          free_shipping_threshold?: number
          id?: number
          instagram_url?: string | null
          logo_url?: string | null
          online_payment_enabled?: boolean
          phone?: string
          seo_description?: string | null
          seo_title?: string | null
          shipping_charge?: number
          tagline?: string
          updated_at?: string
          whatsapp?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          category_id: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          category_id?: string
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variant_images: {
        Row: {
          id: string
          position: number
          url: string
          variant_id: string
        }
        Insert: {
          id?: string
          position?: number
          url: string
          variant_id: string
        }
        Update: {
          id?: string
          position?: number
          url?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
    },
  },
} as const

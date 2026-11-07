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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      household_members: {
        Row: {
          created_at: string
          household_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          created_by: string | null
          expires_on: string
          household_id: string
          id: string
          is_demo: boolean
          name: string
          notes: string | null
          price_cents: number | null
          purchased_on: string | null
          quantity: number
          storage: Database["public"]["Enums"]["storage_location"]
          unit: Database["public"]["Enums"]["quantity_unit"]
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          created_by?: string | null
          expires_on: string
          household_id: string
          id?: string
          is_demo?: boolean
          name: string
          notes?: string | null
          price_cents?: number | null
          purchased_on?: string | null
          quantity: number
          storage?: Database["public"]["Enums"]["storage_location"]
          unit?: Database["public"]["Enums"]["quantity_unit"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          created_by?: string | null
          expires_on?: string
          household_id?: string
          id?: string
          is_demo?: boolean
          name?: string
          notes?: string | null
          price_cents?: number | null
          purchased_on?: string | null
          quantity?: number
          storage?: Database["public"]["Enums"]["storage_location"]
          unit?: Database["public"]["Enums"]["quantity_unit"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          household_id: string
          id: string
          onboarded_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          household_id: string
          id: string
          onboarded_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          household_id?: string
          id?: string
          onboarded_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_items: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          created_by: string | null
          household_id: string
          id: string
          is_demo: boolean
          name: string
          name_key: string | null
          note: string | null
          purchased_at: string | null
          quantity: number
          source: string
          source_recipe: string | null
          unit: Database["public"]["Enums"]["quantity_unit"]
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          created_by?: string | null
          household_id: string
          id?: string
          is_demo?: boolean
          name: string
          name_key?: string | null
          note?: string | null
          purchased_at?: string | null
          quantity?: number
          source?: string
          source_recipe?: string | null
          unit?: Database["public"]["Enums"]["quantity_unit"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          created_by?: string | null
          household_id?: string
          id?: string
          is_demo?: boolean
          name?: string
          name_key?: string | null
          note?: string | null
          purchased_at?: string | null
          quantity?: number
          source?: string
          source_recipe?: string | null
          unit?: Database["public"]["Enums"]["quantity_unit"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      waste_records: {
        Row: {
          category: Database["public"]["Enums"]["product_category"]
          cost_cents: number | null
          created_at: string
          created_by: string | null
          discarded_on: string
          household_id: string
          id: string
          is_demo: boolean
          product_id: string | null
          product_name: string
          quantity: number
          reason: Database["public"]["Enums"]["waste_reason"]
          unit: Database["public"]["Enums"]["quantity_unit"]
        }
        Insert: {
          category?: Database["public"]["Enums"]["product_category"]
          cost_cents?: number | null
          created_at?: string
          created_by?: string | null
          discarded_on?: string
          household_id: string
          id?: string
          is_demo?: boolean
          product_id?: string | null
          product_name: string
          quantity: number
          reason: Database["public"]["Enums"]["waste_reason"]
          unit?: Database["public"]["Enums"]["quantity_unit"]
        }
        Update: {
          category?: Database["public"]["Enums"]["product_category"]
          cost_cents?: number | null
          created_at?: string
          created_by?: string | null
          discarded_on?: string
          household_id?: string
          id?: string
          is_demo?: boolean
          product_id?: string | null
          product_name?: string
          quantity?: number
          reason?: Database["public"]["Enums"]["waste_reason"]
          unit?: Database["public"]["Enums"]["quantity_unit"]
        }
        Relationships: [
          {
            foreignKeyName: "waste_records_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waste_records_product_id_fkey"
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
      consume_product: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: undefined
      }
      discard_product: {
        Args: {
          p_discarded_on: string
          p_product_id: string
          p_quantity: number
          p_reason: Database["public"]["Enums"]["waste_reason"]
        }
        Returns: string
      }
      my_household_ids: { Args: never; Returns: string[] }
      stock_purchased_items: {
        Args: { p_items: Json; p_purchased_on: string }
        Returns: number
      }
    }
    Enums: {
      product_category:
        | "vegetables"
        | "fruits"
        | "dairy"
        | "meat"
        | "fish"
        | "grains"
        | "bakery"
        | "drinks"
        | "other"
      quantity_unit: "pcs" | "g" | "kg" | "ml" | "l" | "pack"
      storage_location: "fridge" | "freezer" | "pantry"
      waste_reason: "expired" | "spoiled" | "leftovers" | "overbought" | "other"
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
      product_category: [
        "vegetables",
        "fruits",
        "dairy",
        "meat",
        "fish",
        "grains",
        "bakery",
        "drinks",
        "other",
      ],
      quantity_unit: ["pcs", "g", "kg", "ml", "l", "pack"],
      storage_location: ["fridge", "freezer", "pantry"],
      waste_reason: ["expired", "spoiled", "leftovers", "overbought", "other"],
    },
  },
} as const


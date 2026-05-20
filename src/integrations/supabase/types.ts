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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      budgets: {
        Row: {
          architect_name: string | null
          client_address: string | null
          client_city: string | null
          client_id: string | null
          client_name: string | null
          client_neighborhood: string | null
          client_state: string | null
          created_at: string
          custom_total: number | null
          delivery_days: number | null
          general_observations: string | null
          id: string
          payment_terms: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          architect_name?: string | null
          client_address?: string | null
          client_city?: string | null
          client_id?: string | null
          client_name?: string | null
          client_neighborhood?: string | null
          client_state?: string | null
          created_at?: string
          custom_total?: number | null
          delivery_days?: number | null
          general_observations?: string | null
          id?: string
          payment_terms?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          architect_name?: string | null
          client_address?: string | null
          client_city?: string | null
          client_id?: string | null
          client_name?: string | null
          client_neighborhood?: string | null
          client_state?: string | null
          created_at?: string
          custom_total?: number | null
          delivery_days?: number | null
          general_observations?: string | null
          id?: string
          payment_terms?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          complement: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          name: string
          neighborhood: string | null
          notes: string | null
          number: string | null
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          name?: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          client_id: string | null
          created_at: string
          ends_at: string | null
          id: string
          notes: string | null
          starts_at: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          starts_at: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          starts_at?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          measurements: string | null
          name: string
          observations: string | null
          room_id: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          measurements?: string | null
          name: string
          observations?: string | null
          room_id: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          measurements?: string | null
          name?: string
          observations?: string | null
          room_id?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "items_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          category: string
          code: string | null
          cost_price: number
          created_at: string
          description: string | null
          id: string
          name: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          code?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          code?: string | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          company_name: string | null
          complement: string | null
          created_at: string
          currency: string
          date_format: string
          default_budget_validity_days: number
          full_name: string | null
          id: string
          instagram: string | null
          legal_name: string | null
          logo_url: string | null
          neighborhood: string | null
          number: string | null
          phone: string | null
          role_title: string | null
          state: string | null
          theme: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          complement?: string | null
          created_at?: string
          currency?: string
          date_format?: string
          default_budget_validity_days?: number
          full_name?: string | null
          id?: string
          instagram?: string | null
          legal_name?: string | null
          logo_url?: string | null
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          role_title?: string | null
          state?: string | null
          theme?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          company_name?: string | null
          complement?: string | null
          created_at?: string
          currency?: string
          date_format?: string
          default_budget_validity_days?: number
          full_name?: string | null
          id?: string
          instagram?: string | null
          legal_name?: string | null
          logo_url?: string | null
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          role_title?: string | null
          state?: string | null
          theme?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget_id: string | null
          created_at: string
          description: string | null
          file_path: string
          file_size: number
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_id?: string | null
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_id?: string | null
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          budget_id: string
          created_at: string
          display_order: number | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          budget_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          budget_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

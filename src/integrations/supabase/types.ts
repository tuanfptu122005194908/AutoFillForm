export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      users: {
        Row: {
          user_id: number
          auth_uid: string | null
          email: string
          password_hash: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id?: number
          auth_uid?: string | null
          email: string
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: number
          auth_uid?: string | null
          email?: string
          password_hash?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profile: {
        Row: {
          profile_id: number
          user_id: number
          full_name: string
          phone: string | null
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          profile_id?: number
          user_id: number
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          profile_id?: number
          user_id?: number
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
      }
      user_wallet: {
        Row: {
          wallet_id: number
          user_id: number
          form_balance: number
          total_forms_added: number
          total_forms_used: number
          last_updated: string
        }
        Insert: {
          wallet_id?: number
          user_id: number
          form_balance?: number
          total_forms_added?: number
          total_forms_used?: number
          last_updated?: string
        }
        Update: {
          wallet_id?: number
          user_id?: number
          form_balance?: number
          total_forms_added?: number
          total_forms_used?: number
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_wallet_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
      }
      orders: {
        Row: {
          order_id: number
          user_id: number
          amount_vnd: number
          forms_to_add: number
          transfer_content: string
          status: Database["public"]["Enums"]["order_status"]
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          order_id?: number
          user_id: number
          amount_vnd: number
          forms_to_add: number
          transfer_content: string
          status?: Database["public"]["Enums"]["order_status"]
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          order_id?: number
          user_id?: number
          amount_vnd?: number
          forms_to_add?: number
          transfer_content?: string
          status?: Database["public"]["Enums"]["order_status"]
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
      }
      payments: {
        Row: {
          payment_id: number
          order_id: number
          bank_account_no: string
          bank_account_name: string
          bank_name: string
          amount_vnd: number
          transfer_content: string
          qr_code_url: string | null
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string | null
          confirmed_by: number | null
          confirmed_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          created_at: string
        }
        Insert: {
          payment_id?: number
          order_id: number
          bank_account_no: string
          bank_account_name: string
          bank_name: string
          amount_vnd: number
          transfer_content: string
          qr_code_url?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          confirmed_by?: number | null
          confirmed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          created_at?: string
        }
        Update: {
          payment_id?: number
          order_id?: number
          bank_account_no?: string
          bank_account_name?: string
          bank_name?: string
          amount_vnd?: number
          transfer_content?: string
          qr_code_url?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          confirmed_by?: number | null
          confirmed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payments_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          }
        ]
      }
      transactions: {
        Row: {
          txn_id: number
          user_id: number
          order_id: number | null
          type: Database["public"]["Enums"]["txn_type"]
          amount: number
          balance_before: number
          balance_after: number
          description: string | null
          created_at: string
        }
        Insert: {
          txn_id?: number
          user_id: number
          order_id?: number | null
          type: Database["public"]["Enums"]["txn_type"]
          amount: number
          balance_before: number
          balance_after: number
          description?: string | null
          created_at?: string
        }
        Update: {
          txn_id?: number
          user_id?: number
          order_id?: number | null
          type?: Database["public"]["Enums"]["txn_type"]
          amount?: number
          balance_before?: number
          balance_after?: number
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          }
        ]
      }
      form_history: {
        Row: {
          history_id: number
          user_id: number
          txn_id: number | null
          tool_name: string | null
          form_url: string | null
          ip_address: string | null
          status: Database["public"]["Enums"]["history_status"]
          error_message: string | null
          ran_at: string
        }
        Insert: {
          history_id?: number
          user_id: number
          txn_id?: number | null
          tool_name?: string | null
          form_url?: string | null
          ip_address?: string | null
          status?: Database["public"]["Enums"]["history_status"]
          error_message?: string | null
          ran_at?: string
        }
        Update: {
          history_id?: number
          user_id?: number
          txn_id?: number | null
          tool_name?: string | null
          form_url?: string | null
          ip_address?: string | null
          status?: Database["public"]["Enums"]["history_status"]
          error_message?: string | null
          ran_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "form_history_txn_id_fkey"
            columns: ["txn_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["txn_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_order: {
        Args: {
          p_order_id: number
          p_admin_user_id: number
        }
        Returns: undefined
      }
      use_form_credit: {
        Args: {
          p_user_id: number
          p_tool_name?: string
          p_form_url?: string
          p_ip_address?: string
        }
        Returns: {
          success: boolean
          message: string
        }[]
      }
    }
    Enums: {
      user_role: "USER" | "ADMIN"
      user_status: "active" | "blocked"
      order_status: "pending" | "approved" | "rejected" | "cancelled"
      payment_status: "pending" | "paid" | "confirmed" | "failed"
      payment_method: "manual" | "auto"
      txn_type: "credit" | "debit"
      history_status: "success" | "failed" | "blocked"
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
    Enums: {
      user_role: ["USER", "ADMIN"] as const,
      user_status: ["active", "blocked"] as const,
      order_status: ["pending", "approved", "rejected", "cancelled"] as const,
      payment_status: ["pending", "paid", "confirmed", "failed"] as const,
      payment_method: ["manual", "auto"] as const,
      txn_type: ["credit", "debit"] as const,
      history_status: ["success", "failed", "blocked"] as const,
    },
  },
} as const

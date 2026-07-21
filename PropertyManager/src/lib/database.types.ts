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
      documents: {
        Row: {
          category: string | null
          created_at: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          project_id: string | null
          property_id: string | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          project_id?: string | null
          property_id?: string | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          project_id?: string | null
          property_id?: string | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string
          expense_date: string
          id: string
          project_id: string | null
          property_id: string | null
          receipt_path: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          expense_date: string
          id?: string
          project_id?: string | null
          property_id?: string | null
          receipt_path?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          project_id?: string | null
          property_id?: string | null
          receipt_path?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          property_id: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          property_id?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          property_id?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sender_id: string | null
          thread_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          thread_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          link: string | null
          metadata: Json | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          link?: string | null
          metadata?: Json | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          link?: string | null
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string
          email: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name: string
          email: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string
          email?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      project_attachments: {
        Row: {
          category: Database["public"]["Enums"]["attachment_category"] | null
          created_at: string | null
          description: string | null
          file_name: string
          file_size: number | null
          id: string
          mime_type: string | null
          project_id: string | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["attachment_category"] | null
          created_at?: string | null
          description?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          project_id?: string | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["attachment_category"] | null
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          project_id?: string | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_message_reads: {
        Row: {
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "project_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_system_message: boolean | null
          project_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          project_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          project_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          assigned_vendor_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          estimated_days: number | null
          id: string
          name: string
          notes: string | null
          order_index: number
          project_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["phase_status"]
          updated_at: string | null
        }
        Insert: {
          assigned_vendor_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_days?: number | null
          id?: string
          name: string
          notes?: string | null
          order_index?: number
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["phase_status"]
          updated_at?: string | null
        }
        Update: {
          assigned_vendor_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_days?: number | null
          id?: string
          name?: string
          notes?: string | null
          order_index?: number
          project_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["phase_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_assigned_vendor_id_fkey"
            columns: ["assigned_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          actual_end_date: string | null
          actual_start_date: string | null
          assigned_to: string | null
          category: Database["public"]["Enums"]["project_category"]
          created_at: string | null
          created_by: string | null
          description: string | null
          estimated_cost: number | null
          estimated_end_date: string | null
          estimated_start_date: string | null
          id: string
          impact_analysis: Json | null
          primary_vendor_id: string | null
          priority: Database["public"]["Enums"]["project_priority"]
          property_id: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["project_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_end_date?: string | null
          estimated_start_date?: string | null
          id?: string
          impact_analysis?: Json | null
          primary_vendor_id?: string | null
          priority?: Database["public"]["Enums"]["project_priority"]
          property_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["project_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_end_date?: string | null
          estimated_start_date?: string | null
          id?: string
          impact_analysis?: Json | null
          primary_vendor_id?: string | null
          priority?: Database["public"]["Enums"]["project_priority"]
          property_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_primary_vendor_id_fkey"
            columns: ["primary_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          bathrooms: number | null
          bedrooms: number | null
          created_at: string | null
          current_market_value: number | null
          id: string
          land_value: number | null
          loan_start_date: string | null
          loan_term_years: number | null
          monthly_rent: number | null
          mortgage_escrow: number | null
          mortgage_interest_rate: number | null
          mortgage_monthly_payment: number | null
          mortgage_principal: number | null
          owner_id: string | null
          pm_id: string | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          purchase_date: string | null
          purchase_price: number | null
          security_deposit: number | null
          square_footage: number | null
          unit_number: string | null
          updated_at: string | null
          year_built: number | null
        }
        Insert: {
          address: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          current_market_value?: number | null
          id?: string
          land_value?: number | null
          loan_start_date?: string | null
          loan_term_years?: number | null
          monthly_rent?: number | null
          mortgage_escrow?: number | null
          mortgage_interest_rate?: number | null
          mortgage_monthly_payment?: number | null
          mortgage_principal?: number | null
          owner_id?: string | null
          pm_id?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          purchase_date?: string | null
          purchase_price?: number | null
          security_deposit?: number | null
          square_footage?: number | null
          unit_number?: string | null
          updated_at?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string | null
          current_market_value?: number | null
          id?: string
          land_value?: number | null
          loan_start_date?: string | null
          loan_term_years?: number | null
          monthly_rent?: number | null
          mortgage_escrow?: number | null
          mortgage_interest_rate?: number | null
          mortgage_monthly_payment?: number | null
          mortgage_principal?: number | null
          owner_id?: string | null
          pm_id?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          purchase_date?: string | null
          purchase_price?: number | null
          security_deposit?: number | null
          square_footage?: number | null
          unit_number?: string | null
          updated_at?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_pm_id_fkey"
            columns: ["pm_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          email: string | null
          emergency_contact: string | null
          emergency_contact_phone: string | null
          id: string
          is_active: boolean | null
          lease_end_date: string | null
          lease_start_date: string | null
          monthly_rent: number | null
          move_in_date: string | null
          name: string
          phone: string | null
          profile_id: string | null
          property_id: string | null
          security_deposit: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_phone?: string | null
          id?: string
          is_active?: boolean | null
          lease_end_date?: string | null
          lease_start_date?: string | null
          monthly_rent?: number | null
          move_in_date?: string | null
          name: string
          phone?: string | null
          profile_id?: string | null
          property_id?: string | null
          security_deposit?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_contact_phone?: string | null
          id?: string
          is_active?: boolean | null
          lease_end_date?: string | null
          lease_start_date?: string | null
          monthly_rent?: number | null
          move_in_date?: string | null
          name?: string
          phone?: string | null
          profile_id?: string | null
          property_id?: string | null
          security_deposit?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenants_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          company_name: string
          contact_name: string | null
          created_at: string | null
          email: string | null
          hourly_rate: number | null
          id: string
          insurance_info: string | null
          is_active: boolean | null
          is_preferred: boolean | null
          license_number: string | null
          notes: string | null
          phone: string | null
          property_id: string | null
          rating: number | null
          specialty: string[] | null
          updated_at: string | null
        }
        Insert: {
          company_name: string
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_info?: string | null
          is_active?: boolean | null
          is_preferred?: boolean | null
          license_number?: string | null
          notes?: string | null
          phone?: string | null
          property_id?: string | null
          rating?: number | null
          specialty?: string[] | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          hourly_rate?: number | null
          id?: string
          insurance_info?: string | null
          is_active?: boolean | null
          is_preferred?: boolean | null
          license_number?: string | null
          notes?: string | null
          phone?: string | null
          property_id?: string | null
          rating?: number | null
          specialty?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      attachment_category:
        | "before"
        | "during"
        | "after"
        | "estimate"
        | "plan"
        | "other"
      entity_type:
        | "individual"
        | "llc"
        | "s_corp"
        | "c_corp"
        | "partnership"
        | "trust"
      phase_status: "pending" | "in_progress" | "completed" | "skipped"
      project_category:
        | "maintenance"
        | "renovation"
        | "repair"
        | "inspection"
        | "upgrade"
        | "landscaping"
        | "hvac"
        | "plumbing"
        | "electrical"
        | "other"
      project_priority: "low" | "medium" | "high" | "urgent"
      project_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "in_progress"
        | "on_hold"
        | "completed"
        | "cancelled"
      property_type:
        | "single_family"
        | "condo"
        | "townhouse"
        | "multi_family"
        | "other"
      user_role: "owner" | "pm" | "tenant"
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
      attachment_category: [
        "before",
        "during",
        "after",
        "estimate",
        "plan",
        "other",
      ],
      entity_type: [
        "individual",
        "llc",
        "s_corp",
        "c_corp",
        "partnership",
        "trust",
      ],
      phase_status: ["pending", "in_progress", "completed", "skipped"],
      project_category: [
        "maintenance",
        "renovation",
        "repair",
        "inspection",
        "upgrade",
        "landscaping",
        "hvac",
        "plumbing",
        "electrical",
        "other",
      ],
      project_priority: ["low", "medium", "high", "urgent"],
      project_status: [
        "draft",
        "pending_approval",
        "approved",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
      ],
      property_type: [
        "single_family",
        "condo",
        "townhouse",
        "multi_family",
        "other",
      ],
      user_role: ["owner", "pm", "tenant"],
    },
  },
} as const

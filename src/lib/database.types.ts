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
      approval_requests: {
        Row: {
          action_question: string
          composite_image_url: string
          created_at: string
          created_by: string
          decided_at: string | null
          description: string
          expires_at: string
          id: string
          project_id: string | null
          status: string
          storage_path: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          action_question: string
          composite_image_url: string
          created_at?: string
          created_by: string
          decided_at?: string | null
          description: string
          expires_at?: string
          id?: string
          project_id?: string | null
          status?: string
          storage_path: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          action_question?: string
          composite_image_url?: string
          created_at?: string
          created_by?: string
          decided_at?: string | null
          description?: string
          expires_at?: string
          id?: string
          project_id?: string | null
          status?: string
          storage_path?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_requests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          teacher_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          teacher_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_submissions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          project_id: string | null
          property_id: string | null
          storage_path: string
          tags: string[]
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          project_id?: string | null
          property_id?: string | null
          storage_path: string
          tags?: string[]
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          project_id?: string | null
          property_id?: string | null
          storage_path?: string
          tags?: string[]
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
      household_members: {
        Row: {
          created_at: string
          household_id: string
          is_primary_contact: boolean
          person_id: string
          profile_id: string | null
          relationship: string | null
        }
        Insert: {
          created_at?: string
          household_id: string
          is_primary_contact?: boolean
          person_id: string
          profile_id?: string | null
          relationship?: string | null
        }
        Update: {
          created_at?: string
          household_id?: string
          is_primary_contact?: boolean
          person_id?: string
          profile_id?: string | null
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          name: string
          property_id: string
          source_provenance: Json
          status: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          property_id: string
          source_provenance?: Json
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          property_id?: string
          source_provenance?: Json
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "households_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_parties: {
        Row: {
          created_at: string
          lease_id: string
          party_role: string
          person_id: string
          signature_status: string
          signed_at: string | null
        }
        Insert: {
          created_at?: string
          lease_id: string
          party_role: string
          person_id: string
          signature_status?: string
          signed_at?: string | null
        }
        Update: {
          created_at?: string
          lease_id?: string
          party_role?: string
          person_id?: string
          signature_status?: string
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lease_parties_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_parties_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          created_at: string
          ends_on: string | null
          household_id: string
          id: string
          monthly_rent: number
          monthly_utilities: number
          notes: string | null
          property_id: string
          security_deposit: number | null
          source_provenance: Json
          starts_on: string
          status: Database["public"]["Enums"]["lease_status"]
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          ends_on?: string | null
          household_id: string
          id?: string
          monthly_rent: number
          monthly_utilities?: number
          notes?: string | null
          property_id: string
          security_deposit?: number | null
          source_provenance?: Json
          starts_on: string
          status?: Database["public"]["Enums"]["lease_status"]
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          ends_on?: string | null
          household_id?: string
          id?: string
          monthly_rent?: number
          monthly_utilities?: number
          notes?: string | null
          property_id?: string
          security_deposit?: number | null
          source_provenance?: Json
          starts_on?: string
          status?: Database["public"]["Enums"]["lease_status"]
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leases_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          amount: number
          correction_of: string | null
          created_at: string
          created_by: string | null
          description: string
          effective_on: string
          household_id: string | null
          id: string
          kind: Database["public"]["Enums"]["ledger_entry_kind"]
          property_id: string
          source_provenance: Json
          status: string
          verified_at: string | null
          work_order_id: string | null
        }
        Insert: {
          amount: number
          correction_of?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          effective_on: string
          household_id?: string | null
          id?: string
          kind: Database["public"]["Enums"]["ledger_entry_kind"]
          property_id: string
          source_provenance?: Json
          status?: string
          verified_at?: string | null
          work_order_id?: string | null
        }
        Update: {
          amount?: number
          correction_of?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          effective_on?: string
          household_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["ledger_entry_kind"]
          property_id?: string
          source_provenance?: Json
          status?: string
          verified_at?: string | null
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_correction_of_fkey"
            columns: ["correction_of"]
            isOneToOne: false
            referencedRelation: "ledger_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
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
      owner_property_financials: {
        Row: {
          annual_income: number | null
          capital_improvements_cost: number | null
          depreciable_value: number | null
          estimated_selling_costs: number | null
          lender_label: string | null
          loan_started_on: string | null
          loan_term_years: number | null
          mortgage_interest_rate: number | null
          mortgage_monthly_escrow: number | null
          mortgage_monthly_principal_interest: number | null
          mortgage_principal: number | null
          mortgage_total_monthly_payment: number | null
          original_loan_amount: number | null
          property_id: string
          source_provenance: Json
          state_income_tax_rate: number | null
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          annual_income?: number | null
          capital_improvements_cost?: number | null
          depreciable_value?: number | null
          estimated_selling_costs?: number | null
          lender_label?: string | null
          loan_started_on?: string | null
          loan_term_years?: number | null
          mortgage_interest_rate?: number | null
          mortgage_monthly_escrow?: number | null
          mortgage_monthly_principal_interest?: number | null
          mortgage_principal?: number | null
          mortgage_total_monthly_payment?: number | null
          original_loan_amount?: number | null
          property_id: string
          source_provenance?: Json
          state_income_tax_rate?: number | null
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          annual_income?: number | null
          capital_improvements_cost?: number | null
          depreciable_value?: number | null
          estimated_selling_costs?: number | null
          lender_label?: string | null
          loan_started_on?: string | null
          loan_term_years?: number | null
          mortgage_interest_rate?: number | null
          mortgage_monthly_escrow?: number | null
          mortgage_monthly_principal_interest?: number | null
          mortgage_principal?: number | null
          mortgage_total_monthly_payment?: number | null
          original_loan_amount?: number | null
          property_id?: string
          source_provenance?: Json
          state_income_tax_rate?: number | null
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_property_financials_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      people: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          source_provenance: Json
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          source_provenance?: Json
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          source_provenance?: Json
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string
          email: string
          id: string
          person_id: string | null
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
          person_id?: string | null
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
          person_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
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
          nickname: string | null
          owner_id: string | null
          pm_id: string | null
          property_type: Database["public"]["Enums"]["property_type"] | null
          purchase_date: string | null
          purchase_price: number | null
          security_deposit: number | null
          source_provenance: Json
          square_footage: number | null
          unit_number: string | null
          updated_at: string | null
          verified_at: string | null
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
          nickname?: string | null
          owner_id?: string | null
          pm_id?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          purchase_date?: string | null
          purchase_price?: number | null
          security_deposit?: number | null
          source_provenance?: Json
          square_footage?: number | null
          unit_number?: string | null
          updated_at?: string | null
          verified_at?: string | null
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
          nickname?: string | null
          owner_id?: string | null
          pm_id?: string | null
          property_type?: Database["public"]["Enums"]["property_type"] | null
          purchase_date?: string | null
          purchase_price?: number | null
          security_deposit?: number | null
          source_provenance?: Json
          square_footage?: number | null
          unit_number?: string | null
          updated_at?: string | null
          verified_at?: string | null
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
      property_documents: {
        Row: {
          category: string
          checksum_sha256: string | null
          created_at: string
          external_url: string | null
          file_name: string
          file_size: number | null
          id: string
          lease_id: string | null
          mime_type: string | null
          property_id: string
          source_provenance: Json
          storage_path: string | null
          uploaded_by: string | null
          verified_at: string | null
          visibility: Database["public"]["Enums"]["file_visibility"]
        }
        Insert: {
          category?: string
          checksum_sha256?: string | null
          created_at?: string
          external_url?: string | null
          file_name: string
          file_size?: number | null
          id?: string
          lease_id?: string | null
          mime_type?: string | null
          property_id: string
          source_provenance?: Json
          storage_path?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          visibility?: Database["public"]["Enums"]["file_visibility"]
        }
        Update: {
          category?: string
          checksum_sha256?: string | null
          created_at?: string
          external_url?: string | null
          file_name?: string
          file_size?: number | null
          id?: string
          lease_id?: string | null
          mime_type?: string | null
          property_id?: string
          source_provenance?: Json
          storage_path?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          visibility?: Database["public"]["Enums"]["file_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_memberships: {
        Row: {
          activated_at: string | null
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          profile_id: string
          property_id: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["property_membership_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          profile_id: string
          property_id: string
          revoked_at?: string | null
          role: Database["public"]["Enums"]["property_membership_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          profile_id?: string
          property_id?: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["property_membership_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_memberships_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_photos: {
        Row: {
          caption: string | null
          captured_at: string | null
          category: string
          checksum_sha256: string | null
          created_at: string
          file_name: string
          file_size: number | null
          id: string
          mime_type: string
          property_id: string
          sort_order: number
          source_provenance: Json
          storage_path: string
          uploaded_by: string | null
          verified_at: string | null
          visibility: Database["public"]["Enums"]["file_visibility"]
        }
        Insert: {
          caption?: string | null
          captured_at?: string | null
          category?: string
          checksum_sha256?: string | null
          created_at?: string
          file_name: string
          file_size?: number | null
          id?: string
          mime_type: string
          property_id: string
          sort_order?: number
          source_provenance?: Json
          storage_path: string
          uploaded_by?: string | null
          verified_at?: string | null
          visibility?: Database["public"]["Enums"]["file_visibility"]
        }
        Update: {
          caption?: string | null
          captured_at?: string | null
          category?: string
          checksum_sha256?: string | null
          created_at?: string
          file_name?: string
          file_size?: number | null
          id?: string
          mime_type?: string
          property_id?: string
          sort_order?: number
          source_provenance?: Json
          storage_path?: string
          uploaded_by?: string | null
          verified_at?: string | null
          visibility?: Database["public"]["Enums"]["file_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_value_observations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          observed_on: string
          property_id: string
          source_label: string
          source_provenance: Json
          source_url: string | null
          value: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          observed_on: string
          property_id: string
          source_label: string
          source_provenance?: Json
          source_url?: string | null
          value: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          observed_on?: string
          property_id?: string
          source_label?: string
          source_provenance?: Json
          source_url?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "property_value_observations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_value_observations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      recovery_imports: {
        Row: {
          classification: string
          created_at: string
          id: string
          imported_by: string | null
          imported_counts: Json
          notes: string | null
          property_id: string | null
          source_hash: string | null
          source_kind: string
          source_label: string
        }
        Insert: {
          classification: string
          created_at?: string
          id?: string
          imported_by?: string | null
          imported_counts?: Json
          notes?: string | null
          property_id?: string | null
          source_hash?: string | null
          source_kind: string
          source_label: string
        }
        Update: {
          classification?: string
          created_at?: string
          id?: string
          imported_by?: string | null
          imported_counts?: Json
          notes?: string | null
          property_id?: string | null
          source_hash?: string | null
          source_kind?: string
          source_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "recovery_imports_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recovery_imports_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          name: string
          philosophy: string | null
          photo_url: string | null
          schedule: Json | null
          settings: Json | null
          tagline: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          name: string
          philosophy?: string | null
          photo_url?: string | null
          schedule?: Json | null
          settings?: Json | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          name?: string
          philosophy?: string | null
          photo_url?: string | null
          schedule?: Json | null
          settings?: Json | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      work_order_events: {
        Row: {
          actor_profile_id: string | null
          body: string | null
          created_at: string
          event_type: string
          from_status: Database["public"]["Enums"]["work_order_status"] | null
          id: string
          metadata: Json
          to_status: Database["public"]["Enums"]["work_order_status"] | null
          work_order_id: string
        }
        Insert: {
          actor_profile_id?: string | null
          body?: string | null
          created_at?: string
          event_type: string
          from_status?: Database["public"]["Enums"]["work_order_status"] | null
          id?: string
          metadata?: Json
          to_status?: Database["public"]["Enums"]["work_order_status"] | null
          work_order_id: string
        }
        Update: {
          actor_profile_id?: string | null
          body?: string | null
          created_at?: string
          event_type?: string
          from_status?: Database["public"]["Enums"]["work_order_status"] | null
          id?: string
          metadata?: Json
          to_status?: Database["public"]["Enums"]["work_order_status"] | null
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_events_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          assigned_profile_id: string | null
          category: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_on: string | null
          household_id: string | null
          id: string
          priority: Database["public"]["Enums"]["work_order_priority"]
          property_id: string
          responsibility: string | null
          scheduled_end: string | null
          scheduled_start: string | null
          source_provenance: Json
          status: Database["public"]["Enums"]["work_order_status"]
          title: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          assigned_profile_id?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_on?: string | null
          household_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["work_order_priority"]
          property_id: string
          responsibility?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          source_provenance?: Json
          status?: Database["public"]["Enums"]["work_order_status"]
          title: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          assigned_profile_id?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_on?: string | null
          household_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["work_order_priority"]
          property_id?: string
          responsibility?: string | null
          scheduled_end?: string | null
          scheduled_start?: string | null
          source_provenance?: Json
          status?: Database["public"]["Enums"]["work_order_status"]
          title?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_assigned_profile_id_fkey"
            columns: ["assigned_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_property_id_fkey"
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
      can_access_household: {
        Args: { target_household_id: string }
        Returns: boolean
      }
      can_access_person: {
        Args: { target_person_id: string }
        Returns: boolean
      }
      can_manage_person: {
        Args: { target_person_id: string }
        Returns: boolean
      }
      can_read_file_visibility: {
        Args: {
          target_property_id: string
          target_visibility: Database["public"]["Enums"]["file_visibility"]
        }
        Returns: boolean
      }
      can_read_storage_scope: {
        Args: { target_property_id: string; target_scope: string }
        Returns: boolean
      }
      create_client_approval: {
        Args: {
          request_action_question: string
          request_description: string
          request_id: string
          request_image_url: string
          request_storage_path: string
          request_token_hash: string
        }
        Returns: {
          action_question: string
          composite_image_url: string
          created_at: string
          decided_at: string
          description: string
          expires_at: string
          id: string
          project_id: string
          status: string
        }[]
      }
      current_property_role: {
        Args: { target_property_id: string }
        Returns: Database["public"]["Enums"]["property_membership_role"]
      }
      decide_client_approval: {
        Args: { request_decision: string; request_token: string }
        Returns: {
          created_project_id: string
          final_status: string
        }[]
      }
      get_client_approval: {
        Args: { request_token: string }
        Returns: {
          action_question: string
          composite_image_url: string
          decided_at: string
          description: string
          expires_at: string
          id: string
          status: string
        }[]
      }
      has_property_role: {
        Args: {
          allowed_roles?: Database["public"]["Enums"]["property_membership_role"][]
          target_property_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      list_client_approvals: {
        Args: never
        Returns: {
          action_question: string
          composite_image_url: string
          created_at: string
          decided_at: string
          description: string
          expires_at: string
          id: string
          project_id: string
          status: string
        }[]
      }
      shares_property_with: {
        Args: { target_profile_id: string }
        Returns: boolean
      }
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
      file_visibility: "shared" | "manager_owner" | "owner" | "tenant"
      lease_status: "draft" | "active" | "expired" | "terminated"
      ledger_entry_kind:
        | "rent_charge"
        | "payment"
        | "expense"
        | "adjustment"
        | "refund"
        | "deposit"
      membership_status: "invited" | "active" | "suspended" | "revoked"
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
      property_membership_role: "admin" | "manager" | "owner" | "tenant"
      property_type:
        | "single_family"
        | "condo"
        | "townhouse"
        | "multi_family"
        | "other"
      user_role: "owner" | "pm" | "tenant" | "admin"
      work_order_priority: "low" | "normal" | "high" | "urgent"
      work_order_status:
        | "reported"
        | "triage"
        | "waiting_approval"
        | "approved"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
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
      file_visibility: ["shared", "manager_owner", "owner", "tenant"],
      lease_status: ["draft", "active", "expired", "terminated"],
      ledger_entry_kind: [
        "rent_charge",
        "payment",
        "expense",
        "adjustment",
        "refund",
        "deposit",
      ],
      membership_status: ["invited", "active", "suspended", "revoked"],
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
      property_membership_role: ["admin", "manager", "owner", "tenant"],
      property_type: [
        "single_family",
        "condo",
        "townhouse",
        "multi_family",
        "other",
      ],
      user_role: ["owner", "pm", "tenant", "admin"],
      work_order_priority: ["low", "normal", "high", "urgent"],
      work_order_status: [
        "reported",
        "triage",
        "waiting_approval",
        "approved",
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const

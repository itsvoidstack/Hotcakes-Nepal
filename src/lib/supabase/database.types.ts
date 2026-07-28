export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          username: string
          password_hash: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          id: string
          category: string
          name: string
          slug: string
          description: string | null
          price: number
          image_url: string | null
          is_featured: boolean
          is_available: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          name: string
          slug: string
          description?: string | null
          price: number
          image_url?: string | null
          is_featured?: boolean
          is_available?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_featured?: boolean
          is_available?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          name: string
          tagline: string | null
          is_active: boolean
          status: string
          type: string
          priority: number
          placement: string
          start_date: string | null
          end_date: string | null
          metadata: Record<string, unknown> | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          tagline?: string | null
          is_active?: boolean
          status?: string
          type?: string
          priority?: number
          placement?: string
          start_date?: string | null
          end_date?: string | null
          metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          tagline?: string | null
          is_active?: boolean
          status?: string
          type?: string
          priority?: number
          placement?: string
          start_date?: string | null
          end_date?: string | null
          metadata?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      streak_records: {
        Row: {
          id: string
          customer_code: string
          phone_number: string
          streak_count: number
          last_stamp_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_code: string
          phone_number: string
          streak_count?: number
          last_stamp_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_code?: string
          phone_number?: string
          streak_count?: number
          last_stamp_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          id: string
          title: string
          description: string | null
          google_form_link: string
          google_sheet_url: string | null
          image_url: string | null
          application_count: number
          unread_count: number
          last_checked_at: string | null
          last_application_at: string | null
          latest_applicant_name: string | null
          status: string
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          google_form_link: string
          google_sheet_url?: string | null
          image_url?: string | null
          application_count?: number
          unread_count?: number
          last_checked_at?: string | null
          last_application_at?: string | null
          latest_applicant_name?: string | null
          status?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          google_form_link?: string
          google_sheet_url?: string | null
          image_url?: string | null
          application_count?: number
          unread_count?: number
          last_checked_at?: string | null
          last_application_at?: string | null
          latest_applicant_name?: string | null
          status?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      order_links: {
        Row: {
          platform: string
          display_name: string | null
          url: string | null
          is_active: boolean
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          platform: string
          display_name?: string | null
          url?: string | null
          is_active?: boolean
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          platform?: string
          display_name?: string | null
          url?: string | null
          is_active?: boolean
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          action: string
          performed_by: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          action: string
          performed_by?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          action?: string
          performed_by?: string | null
          details?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          ip_address: string
          request_count: number
          last_request_at: string
        }
        Insert: {
          ip_address: string
          request_count?: number
          last_request_at?: string
        }
        Update: {
          ip_address?: string
          request_count?: number
          last_request_at?: string
        }
        Relationships: []
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
  }
}

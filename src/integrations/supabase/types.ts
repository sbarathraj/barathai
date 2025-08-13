export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_usage_logs: {
        Row: {
          api_name: string
          created_at: string | null
          endpoint_hit: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          request_method: string | null
          request_payload: Json | null
          response_payload: Json | null
          response_time: number | null
          status_code: number | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          api_name: string
          created_at?: string | null
          endpoint_hit: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          request_method?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          response_time?: number | null
          status_code?: number | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          api_name?: string
          created_at?: string | null
          endpoint_hit?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          request_method?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          response_time?: number | null
          status_code?: number | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          unique_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          unique_url?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          unique_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      image_generation_logs: {
        Row: {
          api_provider: string | null
          created_at: string | null
          error_message: string | null
          guidance_scale: number | null
          has_mask: boolean | null
          has_source_image: boolean | null
          height: number | null
          id: string
          image_metadata: Json | null
          image_size_bytes: number | null
          image_url: string | null
          model_id: string
          model_name: string
          negative_prompt: string | null
          num_inference_steps: number | null
          parameters: Json | null
          processing_time_ms: number | null
          prompt: string
          response_time_ms: number | null
          seed: number | null
          status: string | null
          success: boolean
          task_type: string
          user_email: string | null
          user_id: string | null
          width: number | null
        }
        Insert: {
          api_provider?: string | null
          created_at?: string | null
          error_message?: string | null
          guidance_scale?: number | null
          has_mask?: boolean | null
          has_source_image?: boolean | null
          height?: number | null
          id?: string
          image_metadata?: Json | null
          image_size_bytes?: number | null
          image_url?: string | null
          model_id?: string
          model_name: string
          negative_prompt?: string | null
          num_inference_steps?: number | null
          parameters?: Json | null
          processing_time_ms?: number | null
          prompt: string
          response_time_ms?: number | null
          seed?: number | null
          status?: string | null
          success?: boolean
          task_type: string
          user_email?: string | null
          user_id?: string | null
          width?: number | null
        }
        Update: {
          api_provider?: string | null
          created_at?: string | null
          error_message?: string | null
          guidance_scale?: number | null
          has_mask?: boolean | null
          has_source_image?: boolean | null
          height?: number | null
          id?: string
          image_metadata?: Json | null
          image_size_bytes?: number | null
          image_url?: string | null
          model_id?: string
          model_name?: string
          negative_prompt?: string | null
          num_inference_steps?: number | null
          parameters?: Json | null
          processing_time_ms?: number | null
          prompt?: string
          response_time_ms?: number | null
          seed?: number | null
          status?: string | null
          success?: boolean
          task_type?: string
          user_email?: string | null
          user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login: string | null
          modified_at: string | null
          updated_at: string
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_login?: string | null
          modified_at?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login?: string | null
          modified_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_api_usage_count: {
        Args: { request_type_filter?: string }
        Returns: number
      }
      get_user_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      log_api_usage: {
        Args:
          | {
              p_user_id: string
              p_user_email: string
              p_api_name: string
              p_endpoint_hit: string
              p_request_method?: string
              p_response_time?: number
              p_status_code?: number
              p_request_payload?: Json
              p_response_payload?: Json
              p_error_message?: string
              p_ip_address?: unknown
              p_user_agent?: string
            }
          | {
              p_user_id: string
              p_user_email: string
              p_endpoint: string
              p_request_type: string
              p_response_time?: number
              p_status_code?: number
              p_metadata?: Json
            }
        Returns: string
      }
      update_user_last_login: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      update_user_usage: {
        Args: { p_user_id: string }
        Returns: undefined
      }
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

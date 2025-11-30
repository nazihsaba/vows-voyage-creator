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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      gallery_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_order: number | null
          image_url: string
          wedding_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_order?: number | null
          image_url: string
          wedding_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_order?: number | null
          image_url?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          card_name: string
          card_number: string
          card_order: number | null
          created_at: string | null
          id: string
          logo_url: string | null
          wedding_id: string
        }
        Insert: {
          card_name: string
          card_number: string
          card_order?: number | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          wedding_id: string
        }
        Update: {
          card_name?: string
          card_number?: string
          card_order?: number | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_cards_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_links: {
        Row: {
          created_at: string
          id: string
          link_name: string
          number_of_persons: number
          side: string | null
          unique_slug: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link_name: string
          number_of_persons?: number
          side?: string | null
          unique_slug: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link_name?: string
          number_of_persons?: number
          side?: string | null
          unique_slug?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_links_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      invitees: {
        Row: {
          created_at: string
          id: string
          invitation_link_id: string
          is_attending: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitation_link_id: string
          is_attending?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          invitation_link_id?: string
          is_attending?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitees_invitation_link_id_fkey"
            columns: ["invitation_link_id"]
            isOneToOne: false
            referencedRelation: "invitation_links"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      wedding_locations: {
        Row: {
          created_at: string | null
          id: string
          location_link: string | null
          location_name: string | null
          time: string | null
          type: string
          wedding_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_link?: string | null
          location_name?: string | null
          time?: string | null
          type: string
          wedding_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location_link?: string | null
          location_name?: string | null
          time?: string | null
          type?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_locations_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          audio_end_time: number | null
          audio_start_time: number | null
          audio_url: string | null
          bride_family: string | null
          bride_name: string
          closing_message: string | null
          created_at: string | null
          custom_accent_color: string | null
          custom_font_body: string | null
          custom_font_heading: string | null
          custom_primary_color: string | null
          custom_text_color: string | null
          end_text: string | null
          event_title: string | null
          field_customizations: Json | null
          groom_family: string | null
          groom_name: string
          heading_font_size: string | null
          id: string
          invitation_text: string | null
          locked_name_style: Json | null
          main_description: string | null
          main_picture_url: string | null
          middle_text: string | null
          recipient_name: string | null
          rsvp_deadline: string | null
          slug: string
          status: string | null
          template_type: string | null
          updated_at: string | null
          user_id: string
          video_url: string | null
          wedding_date: string
          welcoming_text: string | null
        }
        Insert: {
          audio_end_time?: number | null
          audio_start_time?: number | null
          audio_url?: string | null
          bride_family?: string | null
          bride_name: string
          closing_message?: string | null
          created_at?: string | null
          custom_accent_color?: string | null
          custom_font_body?: string | null
          custom_font_heading?: string | null
          custom_primary_color?: string | null
          custom_text_color?: string | null
          end_text?: string | null
          event_title?: string | null
          field_customizations?: Json | null
          groom_family?: string | null
          groom_name: string
          heading_font_size?: string | null
          id?: string
          invitation_text?: string | null
          locked_name_style?: Json | null
          main_description?: string | null
          main_picture_url?: string | null
          middle_text?: string | null
          recipient_name?: string | null
          rsvp_deadline?: string | null
          slug: string
          status?: string | null
          template_type?: string | null
          updated_at?: string | null
          user_id: string
          video_url?: string | null
          wedding_date: string
          welcoming_text?: string | null
        }
        Update: {
          audio_end_time?: number | null
          audio_start_time?: number | null
          audio_url?: string | null
          bride_family?: string | null
          bride_name?: string
          closing_message?: string | null
          created_at?: string | null
          custom_accent_color?: string | null
          custom_font_body?: string | null
          custom_font_heading?: string | null
          custom_primary_color?: string | null
          custom_text_color?: string | null
          end_text?: string | null
          event_title?: string | null
          field_customizations?: Json | null
          groom_family?: string | null
          groom_name?: string
          heading_font_size?: string | null
          id?: string
          invitation_text?: string | null
          locked_name_style?: Json | null
          main_description?: string | null
          main_picture_url?: string | null
          middle_text?: string | null
          recipient_name?: string | null
          rsvp_deadline?: string | null
          slug?: string
          status?: string | null
          template_type?: string | null
          updated_at?: string | null
          user_id?: string
          video_url?: string | null
          wedding_date?: string
          welcoming_text?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_otps: { Args: never; Returns: undefined }
      get_masked_card_number: { Args: { card_number: string }; Returns: string }
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

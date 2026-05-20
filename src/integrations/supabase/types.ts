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
          position_y: number | null
          wedding_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_order?: number | null
          image_url: string
          position_y?: number | null
          wedding_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_order?: number | null
          image_url?: string
          position_y?: number | null
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
      guest_photos: {
        Row: {
          created_at: string
          id: string
          storage_path: string
          uploader_name: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          storage_path: string
          uploader_name?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          storage_path?: string
          uploader_name?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_guest_photos_wedding"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_links: {
        Row: {
          country_code: string | null
          created_at: string
          id: string
          link_name: string
          number_of_persons: number
          phone_number: string | null
          side: string | null
          unique_slug: string
          wedding_id: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          id?: string
          link_name: string
          number_of_persons?: number
          phone_number?: string | null
          side?: string | null
          unique_slug: string
          wedding_id: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          id?: string
          link_name?: string
          number_of_persons?: number
          phone_number?: string | null
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
          display_order: number
          id: string
          invitation_link_id: string
          is_attending: boolean | null
          name: string
          table_number: number | null
          wishes_message: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          invitation_link_id: string
          is_attending?: boolean | null
          name: string
          table_number?: number | null
          wishes_message?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          invitation_link_id?: string
          is_attending?: boolean | null
          name?: string
          table_number?: number | null
          wishes_message?: string | null
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
      venue_projects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan_image_url: string | null
          scale: number | null
          updated_at: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string
          plan_image_url?: string | null
          scale?: number | null
          updated_at?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan_image_url?: string | null
          scale?: number | null
          updated_at?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_projects_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_tables: {
        Row: {
          created_at: string | null
          guest_count: number
          height: number
          id: string
          name: string
          rotation: number
          shape: string
          venue_project_id: string
          width: number
          x_position: number
          y_position: number
        }
        Insert: {
          created_at?: string | null
          guest_count?: number
          height?: number
          id?: string
          name?: string
          rotation?: number
          shape?: string
          venue_project_id: string
          width?: number
          x_position?: number
          y_position?: number
        }
        Update: {
          created_at?: string | null
          guest_count?: number
          height?: number
          id?: string
          name?: string
          rotation?: number
          shape?: string
          venue_project_id?: string
          width?: number
          x_position?: number
          y_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "venue_tables_venue_project_id_fkey"
            columns: ["venue_project_id"]
            isOneToOne: false
            referencedRelation: "venue_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_locations: {
        Row: {
          created_at: string | null
          custom_title: string | null
          display_order: number
          icon: string | null
          id: string
          location_link: string | null
          location_name: string | null
          time: string | null
          type: string
          wedding_id: string
        }
        Insert: {
          created_at?: string | null
          custom_title?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          location_link?: string | null
          location_name?: string | null
          time?: string | null
          type: string
          wedding_id: string
        }
        Update: {
          created_at?: string | null
          custom_title?: string | null
          display_order?: number
          icon?: string | null
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
      wedding_shares: {
        Row: {
          created_at: string
          id: string
          shared_with_user_id: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          shared_with_user_id: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          shared_with_user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_shares_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_tables: {
        Row: {
          created_at: string
          id: string
          name: string | null
          table_number: number
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          table_number: number
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          table_number?: number
          wedding_id?: string
        }
        Relationships: []
      }
      weddings: {
        Row: {
          audio_end_time: number | null
          audio_start_time: number | null
          audio_url: string | null
          aura_ending_image_url: string | null
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
          envelope_animation_enabled: boolean
          event_title: string | null
          field_customizations: Json | null
          gallery_subtitle: string | null
          groom_family: string | null
          groom_name: string
          heading_font_size: string | null
          id: string
          invitation_text: string | null
          locked_name_style: Json | null
          lumiere_ending_image_url: string | null
          main_description: string | null
          main_picture_position_y: number | null
          main_picture_url: string | null
          middle_text: string | null
          notification_email: string | null
          payment_external_id: string | null
          payment_status: string | null
          recipient_name: string | null
          rsvp_deadline: string | null
          slug: string
          status: string | null
          template_fonts: Json
          template_type: string | null
          updated_at: string | null
          user_id: string
          venue_payment_status: string | null
          verite_ending_image_url: string | null
          video_poster_url: string | null
          video_url: string | null
          wedding_date: string
          welcoming_text: string | null
          wishes_enabled: boolean
        }
        Insert: {
          audio_end_time?: number | null
          audio_start_time?: number | null
          audio_url?: string | null
          aura_ending_image_url?: string | null
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
          envelope_animation_enabled?: boolean
          event_title?: string | null
          field_customizations?: Json | null
          gallery_subtitle?: string | null
          groom_family?: string | null
          groom_name: string
          heading_font_size?: string | null
          id?: string
          invitation_text?: string | null
          locked_name_style?: Json | null
          lumiere_ending_image_url?: string | null
          main_description?: string | null
          main_picture_position_y?: number | null
          main_picture_url?: string | null
          middle_text?: string | null
          notification_email?: string | null
          payment_external_id?: string | null
          payment_status?: string | null
          recipient_name?: string | null
          rsvp_deadline?: string | null
          slug: string
          status?: string | null
          template_fonts?: Json
          template_type?: string | null
          updated_at?: string | null
          user_id: string
          venue_payment_status?: string | null
          verite_ending_image_url?: string | null
          video_poster_url?: string | null
          video_url?: string | null
          wedding_date: string
          welcoming_text?: string | null
          wishes_enabled?: boolean
        }
        Update: {
          audio_end_time?: number | null
          audio_start_time?: number | null
          audio_url?: string | null
          aura_ending_image_url?: string | null
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
          envelope_animation_enabled?: boolean
          event_title?: string | null
          field_customizations?: Json | null
          gallery_subtitle?: string | null
          groom_family?: string | null
          groom_name?: string
          heading_font_size?: string | null
          id?: string
          invitation_text?: string | null
          locked_name_style?: Json | null
          lumiere_ending_image_url?: string | null
          main_description?: string | null
          main_picture_position_y?: number | null
          main_picture_url?: string | null
          middle_text?: string | null
          notification_email?: string | null
          payment_external_id?: string | null
          payment_status?: string | null
          recipient_name?: string | null
          rsvp_deadline?: string | null
          slug?: string
          status?: string | null
          template_fonts?: Json
          template_type?: string | null
          updated_at?: string | null
          user_id?: string
          venue_payment_status?: string | null
          verite_ending_image_url?: string | null
          video_poster_url?: string | null
          video_url?: string | null
          wedding_date?: string
          welcoming_text?: string | null
          wishes_enabled?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      public_gift_cards: {
        Row: {
          card_name: string | null
          card_number: string | null
          card_order: number | null
          created_at: string | null
          id: string | null
          logo_url: string | null
          wedding_id: string | null
        }
        Insert: {
          card_name?: string | null
          card_number?: string | null
          card_order?: number | null
          created_at?: string | null
          id?: string | null
          logo_url?: string | null
          wedding_id?: string | null
        }
        Update: {
          card_name?: string | null
          card_number?: string | null
          card_order?: number | null
          created_at?: string | null
          id?: string | null
          logo_url?: string | null
          wedding_id?: string | null
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
    }
    Functions: {
      check_email_exists: { Args: { check_email: string }; Returns: boolean }
      get_masked_card_number: { Args: { card_number: string }; Returns: string }
      is_wedding_owner: {
        Args: { _user_id: string; _wedding_id: string }
        Returns: boolean
      }
      is_wedding_shared_with: {
        Args: { _user_id: string; _wedding_id: string }
        Returns: boolean
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

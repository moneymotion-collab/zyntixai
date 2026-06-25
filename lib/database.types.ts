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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_coach_messages: {
        Row: {
          content: string
          content_type: string
          created_at: string
          id: string
          role: string
          thread_id: string
        }
        Insert: {
          content: string
          content_type?: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_coach_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ai_coach_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_coach_threads: {
        Row: {
          created_at: string
          id: string
          last_active: string
          last_message: string | null
          member_id: string
          status: string
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_active?: string
          last_message?: string | null
          member_id: string
          status?: string
          topic: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_active?: string
          last_message?: string | null
          member_id?: string
          status?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_coach_threads_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          brand_id: string
          created_at: string
          credits_used: number
          endpoint: string
          id: string
          user_id: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          credits_used: number
          endpoint?: string
          id?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          credits_used?: number
          endpoint?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          brand_id: string
          comments: number
          created_at: string
          id: string
          likes: number
          platform: string
          post_id: string | null
          saves: number
          shares: number
          views: number
        }
        Insert: {
          brand_id: string
          comments?: number
          created_at?: string
          id?: string
          likes?: number
          platform?: string
          post_id?: string | null
          saves?: number
          shares?: number
          views?: number
        }
        Update: {
          brand_id?: string
          comments?: number
          created_at?: string
          id?: string
          likes?: number
          platform?: string
          post_id?: string | null
          saves?: number
          shares?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_notes: {
        Row: {
          coach_id: string | null
          content: string
          created_at: string
          id: string
          member_id: string
          source_message_id: string | null
        }
        Insert: {
          coach_id?: string | null
          content: string
          created_at?: string
          id?: string
          member_id: string
          source_message_id?: string | null
        }
        Update: {
          coach_id?: string | null
          content?: string
          created_at?: string
          id?: string
          member_id?: string
          source_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_notes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_notes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_requests: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          member_id: string
          status: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          member_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          member_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_requests_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          body_fat: number | null
          created_at: string | null
          email: string | null
          full_name: string
          goal: string | null
          id: string
          notes: string | null
          phone: string | null
          trainer_id: string | null
          weight: number | null
        }
        Insert: {
          body_fat?: number | null
          created_at?: string | null
          email?: string | null
          full_name: string
          goal?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          trainer_id?: string | null
          weight?: number | null
        }
        Update: {
          body_fat?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          goal?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          trainer_id?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          created_at: string
          energy: number | null
          id: string
          member_id: string
          motivation: number | null
          notes: string | null
          sleep: number | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          energy?: number | null
          id?: string
          member_id: string
          motivation?: number | null
          notes?: string | null
          sleep?: number | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          energy?: number | null
          id?: string
          member_id?: string
          motivation?: number | null
          notes?: string | null
          sleep?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      client_checkins: {
        Row: {
          action_plan: string | null
          checkin_date: string
          coach_id: string
          coach_note: string | null
          created_at: string
          energy: number | null
          hunger: number | null
          id: string
          member_id: string | null
          member_name: string
          mood: string | null
          motivation: number | null
          notes: string | null
          sleep: number | null
          sleep_quality: number | null
          stress: number | null
          struggles: string | null
          weight: number | null
          wins: string | null
        }
        Insert: {
          action_plan?: string | null
          checkin_date: string
          coach_id: string
          coach_note?: string | null
          created_at?: string
          energy?: number | null
          hunger?: number | null
          id?: string
          member_id?: string | null
          member_name: string
          mood?: string | null
          motivation?: number | null
          notes?: string | null
          sleep?: number | null
          sleep_quality?: number | null
          stress?: number | null
          struggles?: string | null
          weight?: number | null
          wins?: string | null
        }
        Update: {
          action_plan?: string | null
          checkin_date?: string
          coach_id?: string
          coach_note?: string | null
          created_at?: string
          energy?: number | null
          hunger?: number | null
          id?: string
          member_id?: string | null
          member_name?: string
          mood?: string | null
          motivation?: number | null
          notes?: string | null
          sleep?: number | null
          sleep_quality?: number | null
          stress?: number | null
          struggles?: string | null
          weight?: number | null
          wins?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_checkins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      client_goals: {
        Row: {
          coach_id: string
          created_at: string
          current_value: number
          deadline: string | null
          goal_type: string
          id: string
          member_id: string
          member_name: string
          notes: string | null
          start_value: number
          status: string
          target_date: string
          target_value: number
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          current_value: number
          deadline?: string | null
          goal_type: string
          id?: string
          member_id: string
          member_name: string
          notes?: string | null
          start_value: number
          status?: string
          target_date: string
          target_value: number
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          current_value?: number
          deadline?: string | null
          goal_type?: string
          id?: string
          member_id?: string
          member_name?: string
          notes?: string | null
          start_value?: number
          status?: string
          target_date?: string
          target_value?: number
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_goals_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      client_progress_photos: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          member_id: string
          notes: string | null
          photo_type: string
          photo_url: string
          taken_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          photo_type?: string
          photo_url: string
          taken_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          photo_type?: string
          photo_url?: string
          taken_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_progress_photos_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          coach_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          member_id: string
          note_type: string
          title: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          member_id: string
          note_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          member_id?: string
          note_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      client_habits: {
        Row: {
          coach_id: string
          created_at: string
          habit_name: string
          habit_type: string
          id: string
          logged_at: string
          member_id: string
          notes: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          habit_name: string
          habit_type?: string
          id?: string
          logged_at?: string
          member_id: string
          notes?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          habit_name?: string
          habit_type?: string
          id?: string
          logged_at?: string
          member_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_habits_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reminders: {
        Row: {
          coach_id: string
          created_at: string
          due_date: string
          id: string
          is_automatic: boolean
          member_id: string
          message: string
          priority: string
          reminder_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          due_date?: string
          id?: string
          is_automatic?: boolean
          member_id: string
          message: string
          priority?: string
          reminder_type: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          due_date?: string
          id?: string
          is_automatic?: boolean
          member_id?: string
          message?: string
          priority?: string
          reminder_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_reminders_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          age: number | null
          allergies: string | null
          coach_notes: string | null
          created_at: string
          fitness_level: string | null
          food_preferences: string | null
          gender: string | null
          goal_weight: number | null
          height_cm: number | null
          injuries: string | null
          intake_summary: string | null
          member_id: string
          mobility_notes: string | null
          primary_goal: string | null
          training_days: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          coach_notes?: string | null
          created_at?: string
          fitness_level?: string | null
          food_preferences?: string | null
          gender?: string | null
          goal_weight?: number | null
          height_cm?: number | null
          injuries?: string | null
          intake_summary?: string | null
          member_id: string
          mobility_notes?: string | null
          primary_goal?: string | null
          training_days?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          allergies?: string | null
          coach_notes?: string | null
          created_at?: string
          fitness_level?: string | null
          food_preferences?: string | null
          gender?: string | null
          goal_weight?: number | null
          height_cm?: number | null
          injuries?: string | null
          intake_summary?: string | null
          member_id?: string
          mobility_notes?: string | null
          primary_goal?: string | null
          training_days?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_performance: {
        Row: {
          comments: number
          content_type: string
          created_at: string
          created_by: string
          followers_gained: number
          id: string
          likes: number
          platform: string
          post_id: string | null
          saves: number
          shares: number
          views: number
          title: string
        }
        Insert: {
          comments?: number
          content_type?: string
          created_at?: string
          created_by: string
          followers_gained?: number
          id?: string
          likes?: number
          platform?: string
          post_id?: string | null
          saves?: number
          shares?: number
          views?: number
          title?: string
        }
        Update: {
          comments?: number
          content_type?: string
          created_at?: string
          created_by?: string
          followers_gained?: number
          id?: string
          likes?: number
          platform?: string
          post_id?: string | null
          saves?: number
          shares?: number
          views?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_performance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_performance_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string
          coach_tips: Json
          common_mistakes: Json
          created_at: string
          created_by: string | null
          difficulty: string
          equipment: string
          form_steps: Json
          id: string
          image_url: string | null
          image_urls: string[]
          instructions: string
          is_custom: boolean
          name: string
          primary_muscle: string
          secondary_muscles: string[]
          tips: string
          video_url: string | null
        }
        Insert: {
          category?: string
          coach_tips?: Json
          common_mistakes?: Json
          created_at?: string
          created_by?: string | null
          difficulty?: string
          equipment?: string
          form_steps?: Json
          id?: string
          image_url?: string | null
          image_urls?: string[]
          instructions?: string
          is_custom?: boolean
          name: string
          primary_muscle?: string
          secondary_muscles?: string[]
          tips?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          coach_tips?: Json
          common_mistakes?: Json
          created_at?: string
          created_by?: string | null
          difficulty?: string
          equipment?: string
          form_steps?: Json
          id?: string
          image_url?: string | null
          image_urls?: string[]
          instructions?: string
          is_custom?: boolean
          name?: string
          primary_muscle?: string
          secondary_muscles?: string[]
          tips?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gyms_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_settings: {
        Row: {
          created_at: string
          facebook_url: string
          gym_name: string
          id: string
          instagram_url: string
          is_demo_workspace: boolean
          logo_url: string
          owner_id: string
          primary_color: string
          secondary_color: string
          tiktok_url: string
          updated_at: string
          website: string
        }
        Insert: {
          created_at?: string
          facebook_url?: string
          gym_name?: string
          id?: string
          instagram_url?: string
          is_demo_workspace?: boolean
          logo_url?: string
          owner_id: string
          primary_color?: string
          secondary_color?: string
          tiktok_url?: string
          updated_at?: string
          website?: string
        }
        Update: {
          created_at?: string
          facebook_url?: string
          gym_name?: string
          id?: string
          instagram_url?: string
          is_demo_workspace?: boolean
          logo_url?: string
          owner_id?: string
          primary_color?: string
          secondary_color?: string
          tiktok_url?: string
          updated_at?: string
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_settings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_business_settings: {
        Row: {
          created_at: string
          currency: string
          id: string
          owner_id: string
          revenue_per_member: number
          stripe_account_id: string | null
          stripe_connected: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          owner_id: string
          revenue_per_member?: number
          stripe_account_id?: string | null
          stripe_connected?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          owner_id?: string
          revenue_per_member?: number
          stripe_account_id?: string | null
          stripe_connected?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_business_settings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          ai_credits: number
          created_at: string
          credits_used: number
          description: string
          goals: string
          id: string
          mascot_description: string
          mascot_name: string
          mascot_style: string
          mascot_voice_tone: string
          name: string
          niche: string
          owner_id: string
          plan: string
          platform_focus: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          target_audience: string
          tone_of_voice: string
          updated_at: string
        }
        Insert: {
          ai_credits?: number
          created_at?: string
          credits_used?: number
          description?: string
          goals?: string
          id?: string
          mascot_description?: string
          mascot_name?: string
          mascot_style?: string
          mascot_voice_tone?: string
          name?: string
          niche?: string
          owner_id: string
          plan?: string
          platform_focus?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          target_audience?: string
          tone_of_voice?: string
          updated_at?: string
        }
        Update: {
          ai_credits?: number
          created_at?: string
          credits_used?: number
          description?: string
          goals?: string
          id?: string
          mascot_description?: string
          mascot_name?: string
          mascot_style?: string
          mascot_voice_tone?: string
          name?: string
          niche?: string
          owner_id?: string
          plan?: string
          platform_focus?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          target_audience?: string
          tone_of_voice?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_waitlist: {
        Row: {
          business_type: string
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          business_type: string
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          business_type?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      marketing_settings: {
        Row: {
          business_goal: string
          content_tone: string
          created_at: string
          gym_type: string
          id: string
          owner_id: string
          posting_frequency: string
          preferred_platform: string
          target_audience: string
          updated_at: string
        }
        Insert: {
          business_goal?: string
          content_tone?: string
          created_at?: string
          gym_type?: string
          id?: string
          owner_id: string
          posting_frequency?: string
          preferred_platform?: string
          target_audience?: string
          updated_at?: string
        }
        Update: {
          business_goal?: string
          content_tone?: string
          created_at?: string
          gym_type?: string
          id?: string
          owner_id?: string
          posting_frequency?: string
          preferred_platform?: string
          target_audience?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_settings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          brand_id: string | null
          campaign_goal: string
          campaign_json: Json
          created_at: string
          duration_days: number
          id: string
          name: string
          owner_id: string
          platform: string
          status: string
          target_audience: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          campaign_goal?: string
          campaign_json?: Json
          created_at?: string
          duration_days: number
          id?: string
          name: string
          owner_id: string
          platform?: string
          status?: string
          target_audience?: string
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          campaign_goal?: string
          campaign_json?: Json
          created_at?: string
          duration_days?: number
          id?: string
          name?: string
          owner_id?: string
          platform?: string
          status?: string
          target_audience?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          gym_id: string
          id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          gym_id: string
          id?: string
          role: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          gym_id?: string
          id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      member_allergies: {
        Row: {
          allergy: string
          created_at: string
          id: string
          member_id: string
        }
        Insert: {
          allergy: string
          created_at?: string
          id?: string
          member_id: string
        }
        Update: {
          allergy?: string
          created_at?: string
          id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_allergies_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_food_preferences: {
        Row: {
          created_at: string
          id: string
          member_id: string
          preference: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          preference: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          preference?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_food_preferences_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_nutrition_assignments: {
        Row: {
          assigned_at: string
          member_id: string
          nutrition_plan_id: string
          status: string
        }
        Insert: {
          assigned_at?: string
          member_id: string
          nutrition_plan_id: string
          status?: string
        }
        Update: {
          assigned_at?: string
          member_id?: string
          nutrition_plan_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_nutrition_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_nutrition_assignments_nutrition_plan_id_fkey"
            columns: ["nutrition_plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      member_workout_assignments: {
        Row: {
          assigned_at: string
          member_id: string
          workout_plan_id: string
        }
        Insert: {
          assigned_at?: string
          member_id: string
          workout_plan_id: string
        }
        Update: {
          assigned_at?: string
          member_id?: string
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_workout_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_workout_assignments_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      content_plans: {
        Row: {
          brand_id: string
          created_at: string
          duration_days: number
          goal: string
          id: string
          plan_json: Json
          platform: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          duration_days: number
          goal?: string
          id?: string
          plan_json?: Json
          platform?: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          duration_days?: number
          goal?: string
          id?: string
          plan_json?: Json
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_plans_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_posts: {
        Row: {
          brand_id: string | null
          caption: string
          category: string
          content_plan_id: string | null
          content_type: string
          created_at: string
          created_by: string
          external_post_id: string | null
          goal: string
          hashtags: string
          id: string
          image_url: string | null
          marketing_video_id: string | null
          optimization_reason: string | null
          optimization_status: string | null
          optimized_caption: string | null
          optimized_content: string | null
          optimized_hashtags: string | null
          optimized_score: number | null
          optimized_title: string | null
          original_score: number | null
          plan_day: number | null
          plan_id: string | null
          platform: string
          publish_error: string | null
          published_at: string | null
          retry_count: number
          scheduled_at: string | null
          status: string
          title: string
          topic: string
          updated_at: string
          user_id: string
          video_url: string | null
          video_project_id: string | null
          viral_feedback: string
          viral_score: number | null
          viral_reason: string
          viral_status: string
        }
        Insert: {
          brand_id?: string | null
          caption?: string
          category?: string
          content_plan_id?: string | null
          content_type?: string
          created_at?: string
          created_by: string
          external_post_id?: string | null
          goal?: string
          hashtags?: string
          id?: string
          image_url?: string | null
          marketing_video_id?: string | null
          optimization_reason?: string | null
          optimization_status?: string | null
          optimized_caption?: string | null
          optimized_content?: string | null
          optimized_hashtags?: string | null
          optimized_score?: number | null
          optimized_title?: string | null
          original_score?: number | null
          plan_day?: number | null
          plan_id?: string | null
          platform?: string
          publish_error?: string | null
          published_at?: string | null
          retry_count?: number
          scheduled_at?: string | null
          status?: string
          title: string
          topic?: string
          updated_at?: string
          user_id: string
          video_url?: string | null
          video_project_id?: string | null
          viral_feedback?: string
          viral_score?: number | null
          viral_reason?: string
          viral_status?: string
        }
        Update: {
          brand_id?: string | null
          caption?: string
          category?: string
          content_plan_id?: string | null
          content_type?: string
          created_at?: string
          created_by?: string
          external_post_id?: string | null
          goal?: string
          hashtags?: string
          id?: string
          image_url?: string | null
          marketing_video_id?: string | null
          optimization_reason?: string | null
          optimization_status?: string | null
          optimized_caption?: string | null
          optimized_content?: string | null
          optimized_hashtags?: string | null
          optimized_score?: number | null
          optimized_title?: string | null
          original_score?: number | null
          plan_day?: number | null
          plan_id?: string | null
          platform?: string
          publish_error?: string | null
          published_at?: string | null
          retry_count?: number
          scheduled_at?: string | null
          status?: string
          title?: string
          topic?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
          video_project_id?: string | null
          viral_feedback?: string
          viral_score?: number | null
          viral_reason?: string
          viral_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_posts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_content_plan_id_fkey"
            columns: ["content_plan_id"]
            isOneToOne: false
            referencedRelation: "content_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_marketing_video_id_fkey"
            columns: ["marketing_video_id"]
            isOneToOne: false
            referencedRelation: "marketing_videos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_video_project_id_fkey"
            columns: ["video_project_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_coach_conversations: {
        Row: {
          created_at: string
          id: string
          message: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_coach_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_learning_insights: {
        Row: {
          category: string
          created_at: string
          id: string
          insight_key: string
          message: string
          metrics: Json
          patterns: Json
          priority: number
          profile_id: string
          run_id: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          insight_key: string
          message: string
          metrics?: Json
          patterns?: Json
          priority?: number
          profile_id: string
          run_id: string
          title?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          insight_key?: string
          message?: string
          metrics?: Json
          patterns?: Json
          priority?: number
          profile_id?: string
          run_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_learning_insights_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "marketing_learning_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_learning_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_learning_profiles: {
        Row: {
          average_engagement_rate: number
          best_content_type: string | null
          best_platform: string | null
          best_posting_time: string | null
          created_at: string
          id: string
          post_count: number
          profile_json: Json
          run_id: string
          user_id: string
        }
        Insert: {
          average_engagement_rate?: number
          best_content_type?: string | null
          best_platform?: string | null
          best_posting_time?: string | null
          created_at?: string
          id?: string
          post_count?: number
          profile_json?: Json
          run_id: string
          user_id: string
        }
        Update: {
          average_engagement_rate?: number
          best_content_type?: string | null
          best_platform?: string | null
          best_posting_time?: string | null
          created_at?: string
          id?: string
          post_count?: number
          profile_json?: Json
          run_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_learning_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_recommendations: {
        Row: {
          brand_id: string
          category: string
          created_at: string
          id: string
          message: string
          metrics: Json
          patterns: Json
          priority: number
          recommendation_key: string
          run_id: string
          title: string
          user_id: string
        }
        Insert: {
          brand_id: string
          category?: string
          created_at?: string
          id?: string
          message: string
          metrics?: Json
          patterns?: Json
          priority?: number
          recommendation_key: string
          run_id: string
          title?: string
          user_id: string
        }
        Update: {
          brand_id?: string
          category?: string
          created_at?: string
          id?: string
          message?: string
          metrics?: Json
          patterns?: Json
          priority?: number
          recommendation_key?: string
          run_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_recommendations_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_videos: {
        Row: {
          content_post_id: string | null
          created_at: string
          id: string
          platform: string
          script_json: Json
          status: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          content_post_id?: string | null
          created_at?: string
          id?: string
          platform?: string
          script_json?: Json
          status?: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          content_post_id?: string | null
          created_at?: string
          id?: string
          platform?: string
          script_json?: Json
          status?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_videos_content_post_id_fkey"
            columns: ["content_post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          activity_level: string | null
          age: number | null
          coach_id: string | null
          coach_notes: string | null
          created_at: string | null
          current_weight: number | null
          email: string
          full_name: string
          gender: string | null
          goal: string | null
          height_cm: number | null
          id: string
          intake_summary: string | null
          is_demo: boolean
          phone: string | null
          plan: string | null
          status: string | null
          target_calories: number | null
          target_protein: number | null
          target_weight: number | null
          user_id: string | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          coach_id?: string | null
          coach_notes?: string | null
          created_at?: string | null
          current_weight?: number | null
          email: string
          full_name: string
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          intake_summary?: string | null
          is_demo?: boolean
          phone?: string | null
          plan?: string | null
          status?: string | null
          target_calories?: number | null
          target_protein?: number | null
          target_weight?: number | null
          user_id?: string | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          coach_id?: string | null
          coach_notes?: string | null
          created_at?: string | null
          current_weight?: number | null
          email?: string
          full_name?: string
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          intake_summary?: string | null
          is_demo?: boolean
          phone?: string | null
          plan?: string | null
          status?: string | null
          target_calories?: number | null
          target_protein?: number | null
          target_weight?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plans: {
        Row: {
          assigned_members: number | null
          calories: number | null
          carbs: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          fats: number | null
          goal: string | null
          id: string
          protein: number | null
          title: string
        }
        Insert: {
          assigned_members?: number | null
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fats?: number | null
          goal?: string | null
          id?: string
          protein?: number | null
          title: string
        }
        Update: {
          assigned_members?: number | null
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          fats?: number | null
          goal?: string | null
          id?: string
          protein?: number | null
          title?: string
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          change_value: number | null
          current_value: number | null
          id: string
          member_id: string | null
          metric: string | null
          start_value: number | null
          updated_at: string | null
        }
        Insert: {
          change_value?: number | null
          current_value?: number | null
          id?: string
          member_id?: string | null
          metric?: string | null
          start_value?: number | null
          updated_at?: string | null
        }
        Update: {
          change_value?: number | null
          current_value?: number | null
          id?: string
          member_id?: string | null
          metric?: string | null
          start_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_goals: {
        Row: {
          created_at: string
          current_value: number
          deadline: string
          id: string
          member_id: string
          metric: string
          start_value: number
          status: string
          target_value: number
        }
        Insert: {
          created_at?: string
          current_value?: number
          deadline: string
          id?: string
          member_id: string
          metric: string
          start_value?: number
          status?: string
          target_value: number
        }
        Update: {
          created_at?: string
          current_value?: number
          deadline?: string
          id?: string
          member_id?: string
          metric?: string
          start_value?: number
          status?: string
          target_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "progress_goals_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          billing_plan: string | null
          coach_status: string | null
          created_at: string
          email: string | null
          id: string
          role: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          trial_ends_at: string | null
        }
        Insert: {
          billing_plan?: string | null
          coach_status?: string | null
          created_at?: string
          email?: string | null
          id: string
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
        }
        Update: {
          billing_plan?: string | null
          coach_status?: string | null
          created_at?: string
          email?: string | null
          id?: string
          role?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          coach: string | null
          created_at: string | null
          duration: number | null
          id: string
          member_id: string | null
          notes: string | null
          scheduled_at: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          session_type: string | null
          status: string | null
        }
        Insert: {
          coach?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          member_id?: string | null
          notes?: string | null
          scheduled_at?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          session_type?: string | null
          status?: string | null
        }
        Update: {
          coach?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          member_id?: string | null
          notes?: string | null
          scheduled_at?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          session_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connections: {
        Row: {
          access_token: string
          account_username: string | null
          created_at: string
          id: string
          instagram_business_account_id: string
          page_id: string | null
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          account_username?: string | null
          created_at?: string
          id?: string
          instagram_business_account_id?: string
          page_id?: string | null
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          account_username?: string | null
          created_at?: string
          id?: string
          instagram_business_account_id?: string
          page_id?: string | null
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          content: string
          created_at: string
          hook: string
          id: string
          instagram_container_id: string | null
          instagram_media_id: string | null
          media_type: string | null
          media_url: string | null
          optimization_reason: string | null
          optimization_status: string | null
          optimized_caption: string | null
          optimized_content: string | null
          optimized_hashtags: string | null
          optimized_score: number | null
          optimized_title: string | null
          original_score: number | null
          platform: string
          post_type: string
          publish_error: string | null
          publish_status: string
          published_at: string | null
          retry_count: number
          scheduled_date: string | null
          status: string
          user_id: string
          viral_score: number | null
        }
        Insert: {
          content?: string
          created_at?: string
          hook?: string
          id?: string
          instagram_container_id?: string | null
          instagram_media_id?: string | null
          media_type?: string | null
          media_url?: string | null
          optimization_reason?: string | null
          optimization_status?: string | null
          optimized_caption?: string | null
          optimized_content?: string | null
          optimized_hashtags?: string | null
          optimized_score?: number | null
          optimized_title?: string | null
          original_score?: number | null
          platform?: string
          post_type?: string
          publish_error?: string | null
          publish_status?: string
          published_at?: string | null
          retry_count?: number
          scheduled_date?: string | null
          status?: string
          user_id: string
          viral_score?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          hook?: string
          id?: string
          instagram_container_id?: string | null
          instagram_media_id?: string | null
          media_type?: string | null
          media_url?: string | null
          optimization_reason?: string | null
          optimization_status?: string | null
          optimized_caption?: string | null
          optimized_content?: string | null
          optimized_hashtags?: string | null
          optimized_score?: number | null
          optimized_title?: string | null
          original_score?: number | null
          platform?: string
          post_type?: string
          publish_error?: string | null
          publish_status?: string
          published_at?: string | null
          retry_count?: number
          scheduled_date?: string | null
          viral_score?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_projects: {
        Row: {
          brand_name: string
          caption: string | null
          content_post_id: string | null
          created_at: string
          cta: string | null
          final_render_error: string | null
          final_render_status: string
          final_render_url: string | null
          generated_video_id: string | null
          hashtags: string[]
          hook: string | null
          id: string
          image_generation_status: string
          mascot_description: string | null
          mascot_name: string | null
          mascot_style: string | null
          mascot_image_url: string | null
          music_mood: string | null
          platform: string
          prompt: string
          render_error: string | null
          render_finished_at: string | null
          render_started_at: string | null
          render_status: string
          status: string
          style: string | null
          thumbnail_text: string
          thumbnail_title: string
          thumbnail_url: string | null
          thumbnail_visual: string
          updated_at: string
          user_id: string
          video_url: string | null
          voiceover_script: string | null
          voiceover_status: string
          voiceover_url: string | null
          workflow_summary: string
          workflow_type: string
        }
        Insert: {
          brand_name: string
          caption?: string | null
          content_post_id?: string | null
          created_at?: string
          cta?: string | null
          final_render_error?: string | null
          final_render_status?: string
          final_render_url?: string | null
          generated_video_id?: string | null
          hashtags?: string[]
          hook?: string | null
          id?: string
          image_generation_status?: string
          mascot_description?: string | null
          mascot_name?: string | null
          mascot_style?: string | null
          mascot_image_url?: string | null
          music_mood?: string | null
          platform?: string
          prompt: string
          render_error?: string | null
          render_finished_at?: string | null
          render_started_at?: string | null
          render_status?: string
          status?: string
          style?: string | null
          thumbnail_text?: string
          thumbnail_title?: string
          thumbnail_url?: string | null
          thumbnail_visual?: string
          updated_at?: string
          user_id: string
          video_url?: string | null
          voiceover_script?: string | null
          voiceover_status?: string
          voiceover_url?: string | null
          workflow_summary?: string
          workflow_type?: string
        }
        Update: {
          brand_name?: string
          caption?: string | null
          content_post_id?: string | null
          created_at?: string
          cta?: string | null
          final_render_error?: string | null
          final_render_status?: string
          final_render_url?: string | null
          generated_video_id?: string | null
          hashtags?: string[]
          hook?: string | null
          id?: string
          image_generation_status?: string
          mascot_description?: string | null
          mascot_name?: string | null
          mascot_style?: string | null
          mascot_image_url?: string | null
          music_mood?: string | null
          platform?: string
          prompt?: string
          render_error?: string | null
          render_finished_at?: string | null
          render_started_at?: string | null
          render_status?: string
          status?: string
          style?: string | null
          thumbnail_text?: string
          thumbnail_title?: string
          thumbnail_url?: string | null
          thumbnail_visual?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
          voiceover_script?: string | null
          voiceover_status?: string
          voiceover_url?: string | null
          workflow_summary?: string
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_projects_content_post_id_fkey"
            columns: ["content_post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_scenes: {
        Row: {
          animation_duration: number | null
          animation_type: string | null
          asset_key: string | null
          asset_url: string | null
          audio_status: string
          blur_background: boolean | null
          caption_position: string | null
          camera_motion: string
          created_at: string
          crop_focus: string | null
          cursor_action: string | null
          duration: number
          highlight_area: string | null
          highlight_style: string | null
          id: string
          image_prompt: string
          image_status: string
          image_url: string | null
          layout_style: string | null
          narration: string | null
          narration_audio_url: string | null
          overlay_text: string | null
          professional_purpose: string | null
          scene_index: number
          style: string | null
          text: string
          transition: string
          ui_focus_area: string | null
          video_id: string
          visual: string
          workflow_step: string
          workflow_type: string
          zoom_level: number | null
        }
        Insert: {
          animation_duration?: number | null
          animation_type?: string | null
          asset_key?: string | null
          asset_url?: string | null
          audio_status?: string
          blur_background?: boolean | null
          caption_position?: string | null
          camera_motion?: string
          created_at?: string
          crop_focus?: string | null
          cursor_action?: string | null
          duration?: number
          highlight_area?: string | null
          highlight_style?: string | null
          id?: string
          image_prompt?: string
          image_status?: string
          image_url?: string | null
          layout_style?: string | null
          narration?: string | null
          narration_audio_url?: string | null
          overlay_text?: string | null
          professional_purpose?: string | null
          scene_index: number
          style?: string | null
          text: string
          transition?: string
          ui_focus_area?: string | null
          video_id: string
          visual?: string
          workflow_step?: string
          workflow_type?: string
          zoom_level?: number | null
        }
        Update: {
          animation_duration?: number | null
          animation_type?: string | null
          asset_key?: string | null
          asset_url?: string | null
          audio_status?: string
          blur_background?: boolean | null
          caption_position?: string | null
          camera_motion?: string
          created_at?: string
          crop_focus?: string | null
          cursor_action?: string | null
          duration?: number
          highlight_area?: string | null
          highlight_style?: string | null
          id?: string
          image_prompt?: string
          image_status?: string
          image_url?: string | null
          layout_style?: string | null
          narration?: string | null
          narration_audio_url?: string | null
          overlay_text?: string | null
          professional_purpose?: string | null
          scene_index?: number
          style?: string | null
          text?: string
          transition?: string
          ui_focus_area?: string | null
          video_id?: string
          visual?: string
          workflow_step?: string
          workflow_type?: string
          zoom_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_scenes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_videos: {
        Row: {
          created_at: string
          id: string
          prompt: string | null
          render_error: string | null
          render_finished_at: string | null
          render_started_at: string | null
          render_type: string | null
          script: Json | null
          status: string
          storage_path: string | null
          title: string | null
          updated_at: string
          user_id: string
          video_project_id: string | null
          video_type: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          prompt?: string | null
          render_error?: string | null
          render_finished_at?: string | null
          render_started_at?: string | null
          render_type?: string | null
          script?: Json | null
          status?: string
          storage_path?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          video_project_id?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string | null
          render_error?: string | null
          render_finished_at?: string | null
          render_started_at?: string | null
          render_type?: string | null
          script?: Json | null
          status?: string
          storage_path?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          video_project_id?: string | null
          video_type?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_videos_video_project_id_fkey"
            columns: ["video_project_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      video_outputs: {
        Row: {
          created_at: string
          id: string
          render_url: string
          status: string
          updated_at: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          render_url: string
          status?: string
          updated_at?: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          render_url?: string
          status?: string
          updated_at?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_outputs_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          event_id: string
          event_type: string | null
          id: string
          payload: Json | null
          processed_at: string
          provider: string
        }
        Insert: {
          event_id: string
          event_type?: string | null
          id?: string
          payload?: Json | null
          processed_at?: string
          provider: string
        }
        Update: {
          event_id?: string
          event_type?: string | null
          id?: string
          payload?: Json | null
          processed_at?: string
          provider?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          assigned_members: number | null
          created_at: string | null
          created_by: string | null
          goal: string | null
          id: string
          is_demo: boolean
          title: string
          weeks: number | null
        }
        Insert: {
          assigned_members?: number | null
          created_at?: string | null
          created_by?: string | null
          goal?: string | null
          id?: string
          is_demo?: boolean
          title: string
          weeks?: number | null
        }
        Update: {
          assigned_members?: number | null
          created_at?: string | null
          created_by?: string | null
          goal?: string | null
          id?: string
          is_demo?: boolean
          title?: string
          weeks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_name: string
          id: string
          is_demo: boolean
          order_index: number
          reps: number
          rest_seconds: number
          sets: number
          workout_plan_id: string
        }
        Insert: {
          created_at?: string
          exercise_name: string
          id?: string
          is_demo?: boolean
          order_index?: number
          reps?: number
          rest_seconds?: number
          sets?: number
          workout_plan_id: string
        }
        Update: {
          created_at?: string
          exercise_name?: string
          id?: string
          is_demo?: boolean
          order_index?: number
          reps?: number
          rest_seconds?: number
          sets?: number
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plan_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
          workout_plan_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          workout_plan_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plan_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plan_exercises_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_template_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string
          order_index: number
          reps: string
          rest_seconds: number
          sets: number
          template_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          template_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string
          order_index?: number
          reps?: string
          rest_seconds?: number
          sets?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_template_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_template_exercises_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workout_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          goal: string | null
          id: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          goal?: string | null
          id?: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          goal?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_assignments: {
        Row: {
          assigned_at: string
          completed_at: string | null
          id: string
          is_demo: boolean
          member_id: string
          status: string
          workout_plan_id: string
        }
        Insert: {
          assigned_at?: string
          completed_at?: string | null
          id?: string
          is_demo?: boolean
          member_id: string
          status?: string
          workout_plan_id: string
        }
        Update: {
          assigned_at?: string
          completed_at?: string | null
          id?: string
          is_demo?: boolean
          member_id?: string
          status?: string
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_assignments_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_completions: {
        Row: {
          completed_at: string
          id: string
          member_id: string
          workout_plan_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          member_id: string
          workout_plan_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          member_id?: string
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_completions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_completions_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_brand_credits: {
        Args: {
          p_amount: number
          p_brand_id: string
          p_endpoint: string
        }
        Returns: boolean
      }
      approve_coach_request: {
        Args: {
          p_request_id: string
        }
        Returns: Database["public"]["Tables"]["coach_requests"]["Row"]
      }
      reject_coach_request: {
        Args: {
          p_request_id: string
        }
        Returns: Database["public"]["Tables"]["coach_requests"]["Row"]
      }
      ensure_profile: {
        Args: {
          p_email?: string | null
          p_role?: string | null
        }
        Returns: undefined
      }
      repair_profile_subscription_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_profile_billing: {
        Args: {
          p_user_id: string
          p_subscription_status: string
          p_stripe_customer_id?: string | null
          p_stripe_subscription_id?: string | null
          p_billing_plan?: string | null
          p_trial_ends_at?: string | null
        }
        Returns: undefined
      }
      insert_scheduled_post: {
        Args: {
          p_platform?: string
          p_content?: string
          p_hook?: string
          p_post_type?: string
          p_scheduled_date?: string | null
        }
        Returns: Database["public"]["Tables"]["scheduled_posts"]["Row"]
      }
      link_member_account: {
        Args: Record<string, never>
        Returns: string | null
      }
      refresh_coach_member_links: {
        Args: Record<string, never>
        Returns: number
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
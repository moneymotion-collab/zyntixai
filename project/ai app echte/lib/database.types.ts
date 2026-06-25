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
      member_nutrition_assignments: {
        Row: {
          assigned_at: string
          member_id: string
          nutrition_plan_id: string
        }
        Insert: {
          assigned_at?: string
          member_id: string
          nutrition_plan_id: string
        }
        Update: {
          assigned_at?: string
          member_id?: string
          nutrition_plan_id?: string
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
      members: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          goal: string | null
          id: string
          plan: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          goal?: string | null
          id?: string
          plan?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          goal?: string | null
          id?: string
          plan?: string | null
          status?: string | null
        }
        Relationships: []
      }
      nutrition_plans: {
        Row: {
          assigned_members: number | null
          calories: number | null
          carbs: number | null
          created_at: string | null
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
      sessions: {
        Row: {
          coach: string | null
          created_at: string | null
          duration: number | null
          id: string
          member_id: string | null
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
      workout_plans: {
        Row: {
          assigned_members: number | null
          created_at: string | null
          goal: string | null
          id: string
          title: string
          weeks: number | null
        }
        Insert: {
          assigned_members?: number | null
          created_at?: string | null
          goal?: string | null
          id?: string
          title: string
          weeks?: number | null
        }
        Update: {
          assigned_members?: number | null
          created_at?: string | null
          goal?: string | null
          id?: string
          title?: string
          weeks?: number | null
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
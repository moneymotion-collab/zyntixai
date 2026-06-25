// FITAI -> Supabase: generated Database types placeholder.
//
// After connecting your project, generate real types with:
//
//   npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> --schema public > lib/supabase/database.types.ts
//
// The mock shape below mirrors the local fake data in lib/fake-data.ts so
// you can wire pages to Supabase incrementally.

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: number
          name: string
          email: string
          goal: string
          plan: string
          status: "Active" | "Pending" | "Paused"
          joined_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["members"]["Row"], "id">
        Update: Partial<Database["public"]["Tables"]["members"]["Row"]>
      }
      sessions: {
        Row: {
          id: number
          member_id: number
          type: string
          starts_at: string
          duration_minutes: number
          coach: string
          status: "Confirmed" | "Pending" | "Completed"
        }
        Insert: Omit<Database["public"]["Tables"]["sessions"]["Row"], "id">
        Update: Partial<Database["public"]["Tables"]["sessions"]["Row"]>
      }
      workout_plans: {
        Row: {
          id: number
          name: string
          level: "Beginner" | "Intermediate" | "Advanced"
          focus: string
          duration_weeks: number
          days_per_week: number
        }
        Insert: Omit<Database["public"]["Tables"]["workout_plans"]["Row"], "id">
        Update: Partial<Database["public"]["Tables"]["workout_plans"]["Row"]>
      }
      nutrition_plans: {
        Row: {
          id: number
          name: string
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          type: string
        }
        Insert: Omit<Database["public"]["Tables"]["nutrition_plans"]["Row"], "id">
        Update: Partial<Database["public"]["Tables"]["nutrition_plans"]["Row"]>
      }
      ai_coach_threads: {
        Row: {
          id: number
          member_id: number
          topic: string
          last_message: string
          status: "Awaiting reply" | "Suggestion sent" | "Resolved"
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["ai_coach_threads"]["Row"], "id">
        Update: Partial<Database["public"]["Tables"]["ai_coach_threads"]["Row"]>
      }
      progress_logs: {
        Row: {
          id: number
          member_id: number
          metric: string
          start_value: string
          current_value: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["progress_logs"]["Row"], "id">
        Update: Partial<Database["public"]["Tables"]["progress_logs"]["Row"]>
      }
    }
  }
}
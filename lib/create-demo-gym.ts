import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { saveCoachGymName } from "@/lib/auth/save-coach-gym"
import { DEMO_COACH_PROFILE_NAME } from "@/lib/demo/demo-coach-profile"
import { NUTRITION_ASSIGNMENT_STATUS } from "@/lib/types/nutrition-assignments"

type Navigate = {
  push: (href: string) => void
}

const DEMO_MEMBERS = [
  {
    full_name: "John Power",
    email: "john.power@demo.local",
    goal: "Hypertrophy",
    plan: "Pro",
    status: "Active",
  },
  {
    full_name: "Sarah Fit",
    email: "sarah.fit@demo.local",
    goal: "Weight Loss",
    plan: "Elite",
    status: "Active",
  },
  {
    full_name: "Mike Bulk",
    email: "mike.bulk@demo.local",
    goal: "Muscle Gain",
    plan: "Pro",
    status: "Active",
  },
] as const

const JOHN_WORKOUT = {
  title: "Push / Pull / Legs",
  goal: "Push/Pull/Legs 3x per week",
  weeks: 4,
} as const

const JOHN_NUTRITION = {
  title: "High protein bulk",
  goal: "2800 kcal high protein",
  calories: 2800,
  protein: 180,
  carbs: 280,
  fats: 75,
  description: "2800 kcal high protein",
} as const

export async function createDemoGym(
  supabase: SupabaseClient<Database>,
  router?: Navigate,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: new Error("Not authenticated.") }
  }

  const gymResult = await saveCoachGymName(supabase, user.id, DEMO_COACH_PROFILE_NAME)
  if (gymResult.error) {
    return { error: new Error(gymResult.error) }
  }

  const { data: members, error: membersError } = await supabase
    .from("members")
    .insert(
      DEMO_MEMBERS.map((member) => ({
        ...member,
        coach_id: user.id,
      })),
    )
    .select("id, full_name, email")

  if (membersError || !members?.length) {
    return { error: membersError ?? new Error("Failed to create demo members.") }
  }

  const john = members[0]

  const { data: workoutPlan, error: workoutPlanError } = await supabase
    .from("workout_plans")
    .insert({
      title: JOHN_WORKOUT.title,
      goal: JOHN_WORKOUT.goal,
      weeks: JOHN_WORKOUT.weeks,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (workoutPlanError) {
    return { error: workoutPlanError }
  }

  const { error: workoutAssignError } = await supabase
    .from("workout_assignments")
    .insert({
      member_id: john.id,
      workout_plan_id: workoutPlan.id,
      status: "active",
    })

  if (workoutAssignError) {
    return { error: workoutAssignError }
  }

  const { data: nutritionPlan, error: nutritionPlanError } = await supabase
    .from("nutrition_plans")
    .insert({
      title: JOHN_NUTRITION.title,
      goal: JOHN_NUTRITION.goal,
      calories: JOHN_NUTRITION.calories,
      protein: JOHN_NUTRITION.protein,
      carbs: JOHN_NUTRITION.carbs,
      fats: JOHN_NUTRITION.fats,
      description: JOHN_NUTRITION.description,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (nutritionPlanError) {
    return { error: nutritionPlanError }
  }

  const { error: nutritionAssignError } = await supabase
    .from("member_nutrition_assignments")
    .insert({
      member_id: john.id,
      nutrition_plan_id: nutritionPlan.id,
      status: NUTRITION_ASSIGNMENT_STATUS.active,
    })

  if (nutritionAssignError) {
    return { error: nutritionAssignError }
  }

  if (router) {
    router.push("/dashboard")
  }

  return { members, error: null }
}

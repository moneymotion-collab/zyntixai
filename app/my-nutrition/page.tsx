"use client"

import { useEffect, useState } from "react"
import ProtectedShell from "../components/ProtectedShell"
import NutritionPlanCard from "../components/NutritionPlanCard"
import EmptyState from "@/components/ui/empty-state"
import Badge from "@/components/ui/badge"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { Database } from "@/lib/database.types"
import { resolveLinkedMemberId } from "@/lib/member-link"
import { createClient } from "@/lib/supabase/client"

type NutritionPlan = Database["public"]["Tables"]["nutrition_plans"]["Row"]

type NutritionAssignment = {
  member_id: string
  nutrition_plan_id: string
  assigned_at: string
  status: string
  nutrition_plans: NutritionPlan | null
}

export default function MyNutritionPage() {
  const supabase = createClient()
  const [plans, setPlans] = useState<NutritionAssignment[]>([])

  const fetchNutritionPlans = async () => {
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return
    }

    const memberId = await resolveLinkedMemberId(supabase)

    if (!memberId) {
      return
    }

    const { data, error } = await supabase
      .from("member_nutrition_assignments")
      .select(
        `
        *,
        nutrition_plans (*)
      `,
      )
      .eq("member_id", memberId)
      .order("assigned_at", { ascending: false })

    if (error) {
      console.error(error.message)
      return
    }

    setPlans((data as NutritionAssignment[]) || [])
  }

  useEffect(() => {
    fetchNutritionPlans()
  }, [])

  return (
    <ProtectedShell allowed={["admin", "member"]}>
      <div className="space-y-8 p-6">
        <div>
          <h1 className="text-4xl font-bold text-black">My Nutrition</h1>
          <p className="text-gray-500 mt-2">
            View your assigned nutrition plans and macros.
          </p>
        </div>

        {plans.length === 0 && (
          <EmptyState {...SAAS_EMPTY.nutritionAssigned} variant="light" />
        )}

        <div className="grid gap-6">
          {plans.map((assignment) => {
            const plan = assignment.nutrition_plans
            if (!plan) return null

            return (
              <NutritionPlanCard
                key={`${assignment.member_id}-${assignment.nutrition_plan_id}`}
                plan={plan}
                description={plan.description}
                headerRight={
                  <Badge status={assignment.status}>{assignment.status}</Badge>
                }
              />
            )
          })}
        </div>
      </div>
    </ProtectedShell>
  )
}

"use client"

import { useParams } from "next/navigation"
import WorkoutDetailPage from "../../components/WorkoutDetailPage"

export default function WorkoutPlanDetailRoute() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return null
  }

  return <WorkoutDetailPage workoutPlanId={id} />
}

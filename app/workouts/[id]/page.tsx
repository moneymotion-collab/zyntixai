"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import WorkoutDetailPage from "../../components/WorkoutDetailPage"

export default function WorkoutPlanDetailRoute() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return null
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      }
    >
      <WorkoutDetailPage workoutPlanId={id} />
    </Suspense>
  )
}

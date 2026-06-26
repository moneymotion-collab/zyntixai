"use client"

import Link from "next/link"
import EmptyState from "@/components/ui/empty-state"
import SectionLoadingState from "@/components/ui/section-loading-state"
import { buildAssignWorkoutUrl } from "@/lib/coach-dashboard/coach-action-links"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { MyWorkoutAssignment } from "@/lib/types/my-workouts"

type MemberAssignedWorkoutsSectionProps = {
  assignments: MyWorkoutAssignment[]
  loading?: boolean
  memberId?: string
}

export default function MemberAssignedWorkoutsSection({
  assignments,
  loading = false,
  memberId,
}: MemberAssignedWorkoutsSectionProps) {
  if (loading) {
    return (
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-black">Assigned Workouts</h2>
        <div className="mt-4">
          <SectionLoadingState label="Loading assigned workouts" rows={3} />
        </div>
      </section>
    )
  }

  if (assignments.length === 0) {
    return (
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="sr-only">Assigned Workouts</h2>
        <EmptyState
          {...SAAS_EMPTY.workoutAssignMember}
          variant="light"
          action={
            memberId ? (
              <Link
                href={buildAssignWorkoutUrl(memberId)}
                className="btn-primary-solid"
              >
                Assign a workout plan
              </Link>
            ) : undefined
          }
        />
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-black">Assigned Workouts</h2>
          <p className="mt-1 text-sm text-gray-500">
            Workout plans linked via workout assignments.
          </p>
        </div>
        {memberId ? (
          <Link
            href={buildAssignWorkoutUrl(memberId)}
            className="fitcore-btn-secondary !min-h-9 !px-3 !py-2 !text-xs"
          >
            Assign another
          </Link>
        ) : null}
      </div>

      {assignments.map((assignment) => {
        const plan = assignment.workout_plans
        const exercises = plan?.workout_plan_exercises ?? []

        return (
          <article
            key={assignment.id}
            className="rounded-3xl border bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                {plan ? (
                  <Link
                    href={`/workouts/${plan.id}`}
                    className="text-xl font-semibold text-black transition hover:text-cyan-600"
                  >
                    {plan.title}
                  </Link>
                ) : (
                  <h3 className="text-xl font-semibold text-black">
                    Unknown workout plan
                  </h3>
                )}
                {plan?.goal ? (
                  <p className="mt-1 text-sm text-gray-600">{plan.goal}</p>
                ) : null}
                <p className="mt-2 text-xs text-gray-500">
                  Assigned{" "}
                  {new Date(assignment.assigned_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {assignment.status ? ` · ${assignment.status}` : ""}
                </p>
              </div>
              <span className="rounded-xl bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700">
                {exercises.length} exercise{exercises.length === 1 ? "" : "s"}
              </span>
            </div>

            {exercises.length === 0 ? (
              <EmptyState
                {...SAAS_EMPTY.workoutExercises}
                variant="light"
                compact
              />
            ) : (
              <ul className="mt-5 space-y-2">
                {exercises.map((exercise, index) => (
                  <li
                    key={exercise.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
                        {exercise.order_index || index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-black">
                          {exercise.exercise_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {exercise.sets} sets × {exercise.reps} reps
                          {exercise.rest_seconds
                            ? ` · ${exercise.rest_seconds}s rest`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        )
      })}
    </section>
  )
}

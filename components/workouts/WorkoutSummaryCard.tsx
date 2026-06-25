import { calculateWorkoutSummary, type WorkoutExercise } from "@/lib/workout-summary"

export default function WorkoutSummaryCard({
  title,
  exercises,
}: {
  title: string
  exercises: WorkoutExercise[]
}) {
  const summary = calculateWorkoutSummary(exercises)

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
        Workout Summary
      </p>

      <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-black/30 p-4">
          <p className="text-sm text-gray-400">Exercises</p>
          <p className="text-2xl font-bold text-white">
            {summary.totalExercises}
          </p>
        </div>

        <div className="rounded-2xl bg-black/30 p-4">
          <p className="text-sm text-gray-400">Total Sets</p>
          <p className="text-2xl font-bold text-white">
            {summary.totalSets}
          </p>
        </div>

        <div className="rounded-2xl bg-black/30 p-4">
          <p className="text-sm text-gray-400">Estimated Time</p>
          <p className="text-2xl font-bold text-white">
            {summary.estimatedMinutes} min
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {summary.muscles.length > 0 ? (
          summary.muscles.map((muscle) => (
            <span
              key={muscle}
              className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300"
            >
              {muscle}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-500">No muscles selected yet</span>
        )}
      </div>
    </div>
  )
}

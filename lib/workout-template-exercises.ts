import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type {
  WorkoutTemplate,
  WorkoutTemplateRow,
} from "@/lib/workout-templates"

export type WorkoutTemplateExerciseInput = {
  exercise_id?: string
  exercise_name?: string
  name?: string
  sets?: number
  reps?: string | number
  rest_seconds?: number
  rest?: number
  notes?: string | null
}

export type WorkoutTemplateExerciseTableRow =
  Database["public"]["Tables"]["workout_template_exercises"]["Row"]

export type WorkoutTemplateExerciseInsert =
  Database["public"]["Tables"]["workout_template_exercises"]["Insert"]

type ExerciseJoin = Pick<
  Database["public"]["Tables"]["exercises"]["Row"],
  "id" | "name" | "primary_muscle" | "equipment" | "difficulty"
>

export type WorkoutTemplateExerciseRow = WorkoutTemplateExerciseTableRow & {
  exercises: ExerciseJoin | null
}

const WORKOUT_TEMPLATE_EXERCISES_SELECT = `
  id,
  template_id,
  exercise_id,
  sets,
  reps,
  rest_seconds,
  notes,
  order_index,
  created_at,
  exercises (
    id,
    name,
    primary_muscle,
    equipment,
    difficulty
  )
`

function isMissingColumnError(message: string, column: string): boolean {
  const normalized = message.toLowerCase()
  return (
    normalized.includes(column.toLowerCase()) &&
    (normalized.includes("schema cache") ||
      normalized.includes("does not exist") ||
      normalized.includes("could not find"))
  )
}

function findExerciseIdByName(
  catalog: { id: string; name: string }[],
  name: string,
) {
  const normalized = name.trim().toLowerCase()
  return catalog.find(
    (exercise) => exercise.name.trim().toLowerCase() === normalized,
  )?.id
}

export async function resolveTemplateExerciseRows(
  supabase: SupabaseClient<Database>,
  templateId: string,
  items: WorkoutTemplateExerciseInput[],
) {
  const { data: catalog, error: catalogError } = await supabase
    .from("exercises")
    .select("id, name")

  if (catalogError) {
    return { rows: null, error: catalogError }
  }

  const rows: WorkoutTemplateExerciseInsert[] = []

  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    let exerciseId = item.exercise_id?.trim()

    if (!exerciseId) {
      const exerciseName = (item.exercise_name ?? item.name)?.trim()
      if (!exerciseName) {
        return {
          rows: null,
          error: {
            message: "Each exercise must include exercise_id or exercise_name.",
          },
        }
      }

      exerciseId = findExerciseIdByName(catalog ?? [], exerciseName)
      if (!exerciseId) {
        return {
          rows: null,
          error: {
            message: `Exercise not found in catalog: ${exerciseName}`,
          },
        }
      }
    }

    rows.push({
      template_id: templateId,
      exercise_id: exerciseId,
      sets: Number(item.sets || 3),
      reps: String(item.reps || "10"),
      rest_seconds: Number(item.rest_seconds ?? item.rest ?? 60),
      notes: item.notes ?? "",
      order_index: index,
    })
  }

  return { rows, error: null }
}

export async function insertWorkoutTemplateExercises(
  supabase: SupabaseClient<Database>,
  templateId: string,
  items: WorkoutTemplateExerciseInput[],
) {
  const { rows, error: resolveError } = await resolveTemplateExerciseRows(
    supabase,
    templateId,
    items,
  )

  if (resolveError || !rows) {
    return {
      error: resolveError ?? { message: "Could not prepare template exercises." },
    }
  }

  let { error } = await supabase.from("workout_template_exercises").insert(rows)

  if (error && isMissingColumnError(error.message, "order_index")) {
    const withoutOrderIndex = rows.map(({ order_index: _orderIndex, ...row }) => row)
    ;({ error } = await supabase
      .from("workout_template_exercises")
      .insert(withoutOrderIndex))
  }

  if (error && isMissingColumnError(error.message, "notes")) {
    const withoutNotes = rows.map(
      ({ notes: _notes, order_index: _orderIndex, ...row }) => row,
    )
    ;({ error } = await supabase.from("workout_template_exercises").insert(withoutNotes))
  }

  return { error }
}

export function getTemplateExerciseName(
  row: WorkoutTemplateExerciseRow,
): string {
  return row.exercises?.name ?? "Exercise"
}

type TemplateWithExercisesQuery = WorkoutTemplateRow & {
  workout_template_exercises: WorkoutTemplateExerciseRow[] | null
}

export async function fetchWorkoutTemplatesWithExercises(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ templates: WorkoutTemplate[]; error: { message: string } | null }> {
  const { data, error } = await supabase
    .from("workout_templates")
    .select(
      `
      *,
      workout_template_exercises (
        ${WORKOUT_TEMPLATE_EXERCISES_SELECT}
      )
    `,
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  if (!error) {
    const templates = ((data ?? []) as TemplateWithExercisesQuery[]).map(
      (template) => ({
        ...template,
        workout_template_exercises: template.workout_template_exercises ?? [],
      }),
    )

    return { templates, error: null }
  }

  const { data: templates, error: templatesError } = await supabase
    .from("workout_templates")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  if (templatesError) {
    return { templates: [], error: templatesError }
  }

  if (!templates?.length) {
    return { templates: [], error: null }
  }

  const templateIds = templates.map((template) => template.id)
  const { data: exerciseRows, error: exercisesError } = await supabase
    .from("workout_template_exercises")
    .select(WORKOUT_TEMPLATE_EXERCISES_SELECT)
    .in("template_id", templateIds)

  if (exercisesError) {
    return {
      templates: templates.map((template) => ({
        ...template,
        workout_template_exercises: [],
      })),
      error: exercisesError,
    }
  }

  const grouped = new Map<string, WorkoutTemplateExerciseRow[]>()

  for (const row of (exerciseRows ?? []) as WorkoutTemplateExerciseRow[]) {
    const list = grouped.get(row.template_id) ?? []
    list.push(row)
    grouped.set(row.template_id, list)
  }

  for (const [templateId, list] of grouped) {
    list.sort((a, b) => a.order_index - b.order_index)
    grouped.set(templateId, list)
  }

  return {
    templates: templates.map((template) => ({
      ...template,
      workout_template_exercises: grouped.get(template.id) ?? [],
    })),
    error: null,
  }
}

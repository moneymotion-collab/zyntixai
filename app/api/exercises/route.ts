import { NextResponse } from "next/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"
import { mergeCatalogEnrichment } from "@/lib/exercise-enrichment"
import {
  filterExercises,
  type ExerciseFilters,
} from "@/lib/exercises/filterExercises"
import { createClient } from "@/lib/supabase/server"

function normalizeAll(value: string | null, fallback = "All"): string {
  if (!value || value.toLowerCase() === "all") return fallback
  return value
}

export async function GET(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const search = searchParams.get("search") ?? ""
  const muscle = normalizeAll(searchParams.get("muscle"))
  const equipment = normalizeAll(searchParams.get("equipment"))
  const difficulty = normalizeAll(searchParams.get("difficulty"))
  const workoutCategory = normalizeAll(searchParams.get("workoutCategory"))
  const legacyCategory = searchParams.get("category")

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const enrichedExercises = mergeCatalogEnrichment(data ?? [])

  const filters: ExerciseFilters = {
    search,
    muscle,
    equipment,
    difficulty,
    workoutCategory:
      workoutCategory !== "All"
        ? workoutCategory
        : normalizeAll(legacyCategory),
  }

  const hasActiveFilters =
    search.trim().length > 0 ||
    filters.muscle !== "All" ||
    filters.equipment !== "All" ||
    filters.difficulty !== "All" ||
    (filters.workoutCategory != null && filters.workoutCategory !== "All")

  if (!hasActiveFilters) {
    return NextResponse.json({ exercises: enrichedExercises })
  }

  return NextResponse.json({
    exercises: filterExercises(enrichedExercises, filters),
  })
}

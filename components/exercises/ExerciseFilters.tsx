"use client"

import { SlidersHorizontal, X } from "lucide-react"
import {
  DIFFICULTIES,
  EQUIPMENT_GROUPS,
  EXERCISE_CATEGORIES,
  WORKOUT_CATEGORIES,
  formatExerciseResultCount,
  getActiveExerciseFilters,
  hasActiveExerciseFilters,
  type ExerciseFilters,
} from "@/lib/exercise-library"

type ExerciseFiltersPanelProps = {
  filters: ExerciseFilters
  onChange: (patch: Partial<ExerciseFilters>) => void
  onReset: () => void
  resultCount: number
  loading?: boolean
}

const CATEGORY_OPTIONS = EXERCISE_CATEGORIES.filter((option) => option !== "All")
const EQUIPMENT_OPTIONS = EQUIPMENT_GROUPS.filter((option) => option !== "All")
const DIFFICULTY_OPTIONS = DIFFICULTIES.filter((option) => option !== "All")
const WORKOUT_CATEGORY_OPTIONS = WORKOUT_CATEGORIES.filter(
  (option) => option !== "All",
)

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`filter-chip ${active ? "filter-chip-active" : ""}`}
    >
      {label}
    </button>
  )
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  const isActive = value !== "All"

  return (
    <label className="min-w-[9.5rem] flex-1 sm:flex-none">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className={`premium-select ${
          isActive ? "border-blue-500 bg-blue-50 text-gray-900" : ""
        }`}
      >
        <option value="All">
          All
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function ExerciseFiltersPanel({
  filters,
  onChange,
  onReset,
  resultCount,
  loading = false,
}: ExerciseFiltersPanelProps) {
  const activeFilters = getActiveExerciseFilters(filters)
  const hasActive = hasActiveExerciseFilters(filters)

  const clearFilter = (key: keyof ExerciseFilters) => {
    if (key === "search") {
      onChange({ search: "" })
      return
    }
    if (key === "workoutCategory") {
      onChange({ workoutCategory: "All" })
      return
    }
    onChange({ [key]: "All" })
  }

  return (
    <section className="glass-panel p-4 sm:p-5" aria-label="Exercise filters">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-indigo-300">
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Filters</h2>
            <p
              className="text-sm tabular-nums text-slate-400"
              aria-live="polite"
              aria-atomic="true"
            >
              {loading ? "Loading exercises…" : formatExerciseResultCount(resultCount)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <FilterDropdown
            label="Equipment"
            value={filters.equipment}
            options={EQUIPMENT_OPTIONS}
            onChange={(equipment) => onChange({ equipment })}
          />
          <FilterDropdown
            label="Difficulty"
            value={filters.difficulty}
            options={DIFFICULTY_OPTIONS}
            onChange={(difficulty) => onChange({ difficulty })}
          />
          <FilterDropdown
            label="Category"
            value={filters.workoutCategory ?? "All"}
            options={WORKOUT_CATEGORY_OPTIONS}
            onChange={(workoutCategory) => onChange({ workoutCategory })}
          />
          {hasActive ? (
            <button
              type="button"
              onClick={onReset}
              className="btn-ghost shrink-0 px-4 py-2.5 text-sm"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 border-t border-white/8 pt-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Muscle
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          <FilterChip
            label="All"
            active={filters.muscle === "All"}
            onClick={() => onChange({ muscle: "All" })}
          />
          {CATEGORY_OPTIONS.map((muscleGroup) => (
            <FilterChip
              key={muscleGroup}
              label={muscleGroup}
              active={filters.muscle === muscleGroup}
              onClick={() =>
                onChange({
                  muscle: filters.muscle === muscleGroup ? "All" : muscleGroup,
                })
              }
            />
          ))}
        </div>
      </div>

      {hasActive ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
          <span className="text-xs font-medium text-slate-500">Active:</span>
          {activeFilters.map((filter) => (
            <button
              key={`${filter.key}-${filter.value}`}
              type="button"
              onClick={() => clearFilter(filter.key)}
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-100 transition hover:border-indigo-300/50 hover:bg-indigo-500/15"
            >
              <span className="text-indigo-300/80">{filter.label}:</span>
              <span>{filter.value}</span>
              <X className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
              <span className="sr-only">Remove {filter.label} filter</span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}

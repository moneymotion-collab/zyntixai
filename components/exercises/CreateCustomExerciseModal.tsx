"use client"

import { useMemo, useState } from "react"
import { ImagePlus, Plus, Trash2 } from "lucide-react"
import {
  DIFFICULTIES,
  EQUIPMENT_GROUPS,
  EXERCISE_CATEGORIES,
  type Exercise,
} from "@/lib/exercise-library"
import type { CoachTip, CommonMistake, FormStep } from "@/lib/exercise-metadata"
import { uploadExerciseImages } from "@/lib/exercise-images"
import { getCoachScope } from "@/lib/auth/coach-scope"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"
import { createClient } from "@/lib/supabase/client"
import AnimatedModal, { useMountAnimatedModal } from "@/components/ui/animated-modal"

type CreateCustomExerciseModalProps = {
  onClose: () => void
  onCreated: (exercise: Exercise) => void
}

type FormState = {
  name: string
  category: string
  primaryMuscle: string
  secondaryMuscles: string
  equipment: string
  difficulty: string
  instructions: string
  videoUrl: string
  formSteps: FormStep[]
  commonMistakes: CommonMistake[]
  coachTips: CoachTip[]
}

const INITIAL_FORM: FormState = {
  name: "",
  category: "Strength",
  primaryMuscle: "Chest",
  secondaryMuscles: "",
  equipment: "Dumbbell",
  difficulty: "Intermediate",
  instructions: "",
  videoUrl: "",
  formSteps: [{ step: 1, instruction: "" }],
  commonMistakes: [],
  coachTips: [],
}

function categoryOptions() {
  return EXERCISE_CATEGORIES.filter((group) => group !== "All")
}

function equipmentOptions() {
  return EQUIPMENT_GROUPS.filter((group) => group !== "All")
}

function difficultyOptions() {
  return DIFFICULTIES.filter((level) => level !== "All")
}

export default function CreateCustomExerciseModal({
  onClose,
  onCreated,
}: CreateCustomExerciseModalProps) {
  const supabase = useMemo(() => createClient(), [])
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)

  const updateForm = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }))
  }

  const addFormStep = () => {
    updateForm({
      formSteps: [
        ...form.formSteps,
        { step: form.formSteps.length + 1, instruction: "" },
      ],
    })
  }

  const updateFormStep = (index: number, instruction: string) => {
    updateForm({
      formSteps: form.formSteps.map((item, i) =>
        i === index ? { ...item, step: i + 1, instruction } : item,
      ),
    })
  }

  const removeFormStep = (index: number) => {
    updateForm({
      formSteps: form.formSteps
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, step: i + 1 })),
    })
  }

  const addCommonMistake = () => {
    updateForm({
      commonMistakes: [...form.commonMistakes, { title: "", description: "" }],
    })
  }

  const updateCommonMistake = (
    index: number,
    patch: Partial<CommonMistake>,
  ) => {
    updateForm({
      commonMistakes: form.commonMistakes.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    })
  }

  const removeCommonMistake = (index: number) => {
    updateForm({
      commonMistakes: form.commonMistakes.filter((_, i) => i !== index),
    })
  }

  const addCoachTip = () => {
    updateForm({ coachTips: [...form.coachTips, { tip: "" }] })
  }

  const updateCoachTip = (index: number, tip: string) => {
    updateForm({
      coachTips: form.coachTips.map((item, i) =>
        i === index ? { tip } : item,
      ),
    })
  }

  const removeCoachTip = (index: number) => {
    updateForm({ coachTips: form.coachTips.filter((_, i) => i !== index) })
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    setImageFiles((current) => [...current, ...files])
    event.target.value = ""
  }

  const removeImage = (index: number) => {
    setImageFiles((current) => current.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const trimmedName = form.name.trim()
    if (!trimmedName) {
      setErrorMessage("Exercise name is required.")
      return
    }

    setSaving(true)
    setErrorMessage(null)

    const scope = await getCoachScope(supabase)
    if (!scope.userId || (!scope.isCoach && !scope.isAdmin)) {
      setErrorMessage("Only coaches can create custom exercises.")
      setSaving(false)
      return
    }

    const formSteps = form.formSteps
      .map((item, index) => ({
        step: index + 1,
        instruction: item.instruction.trim(),
      }))
      .filter((item) => item.instruction)

    const commonMistakes = form.commonMistakes
      .map((item) => ({
        title: item.title.trim(),
        description: item.description.trim(),
      }))
      .filter((item) => item.title || item.description)

    const coachTips = form.coachTips
      .map((item) => ({ tip: item.tip.trim() }))
      .filter((item) => item.tip)

    const secondaryMuscles = form.secondaryMuscles
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)

    const { data: created, error: insertError } = await supabase
      .from("exercises")
      .insert({
        name: trimmedName,
        category: form.category,
        primary_muscle: form.primaryMuscle,
        secondary_muscles: secondaryMuscles,
        equipment: form.equipment,
        difficulty: form.difficulty,
        instructions: form.instructions.trim(),
        video_url: form.videoUrl.trim() || null,
        form_steps: formSteps,
        common_mistakes: commonMistakes,
        coach_tips: coachTips,
        is_custom: true,
        created_by: scope.userId,
      })
      .select("*")
      .single()

    if (insertError || !created) {
      reportSupabaseError("[exercises] create custom exercise failed", insertError, {
        setError: setErrorMessage,
        fallbackMessage: "Failed to create exercise.",
      })
      setSaving(false)
      return
    }

    let savedExercise = created

    if (imageFiles.length > 0) {
      const { urls, error: uploadError } = await uploadExerciseImages(
        supabase,
        scope.userId,
        created.id,
        imageFiles,
      )

      if (uploadError) {
        reportSupabaseError("[exercises] custom exercise image upload failed", uploadError, {
          setError: setErrorMessage,
          fallbackMessage: "Exercise created but image upload failed.",
        })
        setSaving(false)
        onCreated(savedExercise)
        return
      }

      const { data: updated, error: updateError } = await supabase
        .from("exercises")
        .update({
          image_urls: urls,
          image_url: urls[0] ?? null,
        })
        .eq("id", created.id)
        .select("*")
        .single()

      if (updateError) {
        reportSupabaseError("[exercises] custom exercise image update failed", updateError, {
          setError: setErrorMessage,
          fallbackMessage: "Exercise created but image metadata could not be saved.",
        })
        setSaving(false)
        onCreated({ ...savedExercise, image_urls: urls, image_url: urls[0] ?? null })
        return
      }

      savedExercise = updated ?? { ...savedExercise, image_urls: urls, image_url: urls[0] ?? null }
    }

    onCreated(savedExercise)
    setSaving(false)
    requestClose()
  }

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="create-exercise-title"
      panelClassName="glass-panel max-h-[90vh] max-w-2xl overflow-y-auto p-6 shadow-glow sm:p-8"
      backdropClassName="bg-black/70 backdrop-blur-sm"
    >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="create-exercise-title" className="text-2xl font-bold text-white">
              Create custom exercise
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Custom exercises are private to you and show a CUSTOM badge in your library.
            </p>
          </div>
          <button type="button" onClick={requestClose} className="btn-ghost shrink-0 px-3 py-1.5">
            Close
          </button>
        </div>

        {errorMessage ? (
          <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </p>
        ) : null}

        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
              className="premium-input"
              placeholder="e.g. Single-arm cable press"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Primary muscle
              </span>
              <select
                value={form.primaryMuscle}
                onChange={(event) => updateForm({ primaryMuscle: event.target.value })}
                className="premium-select"
              >
                {categoryOptions().map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Equipment</span>
              <select
                value={form.equipment}
                onChange={(event) => updateForm({ equipment: event.target.value })}
                className="premium-select"
              >
                {equipmentOptions().map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Difficulty</span>
              <select
                value={form.difficulty}
                onChange={(event) => updateForm({ difficulty: event.target.value })}
                className="premium-select"
              >
                {difficultyOptions().map((option) => (
                  <option key={option} value={option} className="bg-slate-900">
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Secondary muscles
              </span>
              <input
                type="text"
                value={form.secondaryMuscles}
                onChange={(event) => updateForm({ secondaryMuscles: event.target.value })}
                className="premium-input"
                placeholder="Comma-separated"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Overview instructions
            </span>
            <textarea
              value={form.instructions}
              onChange={(event) => updateForm({ instructions: event.target.value })}
              className="premium-input min-h-24"
              placeholder="Short summary of the movement"
            />
          </label>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-200">Form steps</h3>
              <button type="button" onClick={addFormStep} className="btn-ghost px-3 py-1.5 text-xs">
                <Plus className="mr-1 inline h-3.5 w-3.5" />
                Add step
              </button>
            </div>
            <div className="space-y-3">
              {form.formSteps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <span className="mt-2.5 w-8 shrink-0 text-sm font-medium text-indigo-300">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={step.instruction}
                    onChange={(event) => updateFormStep(index, event.target.value)}
                    className="premium-input flex-1"
                    placeholder="Step instruction"
                  />
                  {form.formSteps.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeFormStep(index)}
                      className="btn-ghost shrink-0 px-2"
                      aria-label="Remove step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-200">Common mistakes</h3>
              <button
                type="button"
                onClick={addCommonMistake}
                className="btn-ghost px-3 py-1.5 text-xs"
              >
                <Plus className="mr-1 inline h-3.5 w-3.5" />
                Add mistake
              </button>
            </div>
            {form.commonMistakes.length === 0 ? (
              <p className="text-sm text-slate-500">No common mistakes added yet.</p>
            ) : (
              <div className="space-y-3">
                {form.commonMistakes.map((mistake, index) => (
                  <div key={index} className="space-y-2 rounded-xl border border-white/10 p-3">
                    <input
                      type="text"
                      value={mistake.title}
                      onChange={(event) =>
                        updateCommonMistake(index, { title: event.target.value })
                      }
                      className="premium-input"
                      placeholder="Mistake title"
                    />
                    <textarea
                      value={mistake.description}
                      onChange={(event) =>
                        updateCommonMistake(index, { description: event.target.value })
                      }
                      className="premium-input min-h-20"
                      placeholder="What goes wrong and how to fix it"
                    />
                    <button
                      type="button"
                      onClick={() => removeCommonMistake(index)}
                      className="btn-ghost px-2 py-1 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-200">Coach tips</h3>
              <button type="button" onClick={addCoachTip} className="btn-ghost px-3 py-1.5 text-xs">
                <Plus className="mr-1 inline h-3.5 w-3.5" />
                Add tip
              </button>
            </div>
            {form.coachTips.length === 0 ? (
              <p className="text-sm text-slate-500">No coach tips added yet.</p>
            ) : (
              <div className="space-y-2">
                {form.coachTips.map((tip, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tip.tip}
                      onChange={(event) => updateCoachTip(index, event.target.value)}
                      className="premium-input flex-1"
                      placeholder="Coaching cue"
                    />
                    <button
                      type="button"
                      onClick={() => removeCoachTip(index)}
                      className="btn-ghost shrink-0 px-2"
                      aria-label="Remove tip"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Demo video URL (optional)
            </span>
            <input
              type="url"
              value={form.videoUrl}
              onChange={(event) => updateForm({ videoUrl: event.target.value })}
              className="premium-input"
              placeholder="https://..."
            />
          </label>

          <section>
            <span className="mb-2 block text-sm font-medium text-slate-300">Images</span>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 transition hover:border-indigo-400/40 hover:bg-white/[0.04]">
              <ImagePlus className="h-8 w-8 text-slate-400" />
              <span className="text-sm text-slate-400">Click to upload images</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageChange}
                className="sr-only"
              />
            </label>
            {imageFiles.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {imageFiles.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-slate-300"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="btn-ghost shrink-0 px-2 py-1 text-xs"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={requestClose} className="btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving}
            className="btn-gradient"
          >
            {saving ? "Creating…" : "Create exercise"}
          </button>
        </div>
    </AnimatedModal>
  )
}

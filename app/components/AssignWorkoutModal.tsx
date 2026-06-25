"use client"

import type { Database } from "@/lib/database.types"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import AnimatedModal, { useCloseOnSuccess, useMountAnimatedModal } from "@/components/ui/animated-modal"

type Member = Database["public"]["Tables"]["members"]["Row"]
type WorkoutPlan = Database["public"]["Tables"]["workout_plans"]["Row"]

type AssignWorkoutModalProps = {
  workoutPlan: WorkoutPlan
  members: Member[]
  selectedMemberId: string
  onSelectMember: (memberId: string) => void
  onClose: () => void
  onSave: () => void
  saving: boolean
  errorMessage: string | null
  closeSignal?: number
}

export default function AssignWorkoutModal({
  workoutPlan,
  members,
  selectedMemberId,
  onSelectMember,
  onClose,
  onSave,
  saving,
  errorMessage,
  closeSignal,
}: AssignWorkoutModalProps) {
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)
  useCloseOnSuccess(closeSignal, saving, requestClose)

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="assign-workout-title"
      panelClassName="max-w-lg rounded-2xl border border-white/10 bg-[#0b1224] p-6 text-white shadow-xl"
      backdropClassName="bg-black/70"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 id="assign-workout-title" className="text-2xl font-bold">
            Assign workout
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Assign <span className="text-cyan-400">{workoutPlan.title}</span> to
            a member
          </p>
        </div>
        <button
          type="button"
          onClick={requestClose}
          className="rounded-xl border border-white/10 px-3 py-1 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          Close
        </button>
      </div>

      {errorMessage ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {members.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-zinc-400">
          <span className="block font-semibold text-white">
            {SAAS_EMPTY.workoutMembersRequired.title}
          </span>
          <span className="mt-2 block text-sm">{SAAS_EMPTY.workoutMembersRequired.description}</span>
        </p>
      ) : (
        <select
          value={selectedMemberId}
          onChange={(e) => onSelectMember(e.target.value)}
          className="premium-select w-full"
        >
          <option value="" className="bg-zinc-900">
            Select member
          </option>
          {members.map((member) => (
            <option key={member.id} value={member.id} className="bg-zinc-900">
              {member.full_name ?? member.email ?? member.id}
            </option>
          ))}
        </select>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={requestClose}
          className="rounded-xl border border-white/10 px-6 py-3 text-zinc-300 transition hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !selectedMemberId || members.length === 0}
          className="btn-gradient px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Assigning…" : "Assign workout"}
        </button>
      </div>
    </AnimatedModal>
  )
}

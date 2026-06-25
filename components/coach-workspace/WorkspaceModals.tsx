"use client"

import type { ReactNode } from "react"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import AnimatedModal, { useCloseOnSuccess, useMountAnimatedModal } from "@/components/ui/animated-modal"
import type { SaasEmptyPreset } from "@/lib/copy/empty-state-presets"

type PlanOption = { id: string; title: string; goal?: string | null }

type WorkspacePickerModalProps = {
  title: string
  description: string
  plans: PlanOption[]
  selectedPlanId: string
  onSelectPlan: (planId: string) => void
  onClose: () => void
  onSave: () => void | Promise<void>
  saving: boolean
  errorMessage: string | null
  closeSignal?: number
  emptyPreset: SaasEmptyPreset
  emptyAction?: ReactNode
}

export function WorkspacePickerModal({
  title,
  description,
  plans,
  selectedPlanId,
  onSelectPlan,
  onClose,
  onSave,
  saving,
  errorMessage,
  closeSignal,
  emptyPreset,
  emptyAction,
}: WorkspacePickerModalProps) {
  return (
    <ModalShell
      title={title}
      description={description}
      onClose={onClose}
      saving={saving}
      closeSignal={closeSignal}
    >
      {errorMessage ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      {plans.length === 0 ? (
        <SaasEmptyState
          preset={emptyPreset}
          compact
          action={emptyAction}
          showAction={Boolean(emptyAction)}
        />
      ) : (
        <select
          value={selectedPlanId}
          onChange={(e) => onSelectPlan(e.target.value)}
          className="premium-select w-full"
        >
          <option value="">
            Select plan
          </option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.title}
              {plan.goal ? ` · ${plan.goal}` : ""}
            </option>
          ))}
        </select>
      )}

      <ModalActions
        onClose={onClose}
        onSave={onSave}
        saving={saving}
        disabled={!selectedPlanId || plans.length === 0}
      />
    </ModalShell>
  )
}

type ScheduleSessionModalProps = {
  memberName: string
  scheduledDate: string
  scheduledTime: string
  sessionType: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  onSessionTypeChange: (value: string) => void
  onClose: () => void
  onSave: () => void | Promise<void>
  saving: boolean
  errorMessage: string | null
  closeSignal?: number
}

export function ScheduleSessionModal({
  memberName,
  scheduledDate,
  scheduledTime,
  sessionType,
  onDateChange,
  onTimeChange,
  onSessionTypeChange,
  onClose,
  onSave,
  saving,
  errorMessage,
  closeSignal,
}: ScheduleSessionModalProps) {
  return (
    <ModalShell
      title="Schedule session"
      description={`Book a session for ${memberName}`}
      onClose={onClose}
      saving={saving}
      closeSignal={closeSignal}
    >
      {errorMessage ? (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </p>
      ) : null}

      <div className="space-y-3">
        <label className="block text-sm text-slate-400">
          Date
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="premium-input mt-1 w-full"
          />
        </label>
        <label className="block text-sm text-slate-400">
          Time
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="premium-input mt-1 w-full"
          />
        </label>
        <label className="block text-sm text-slate-400">
          Session type
          <input
            type="text"
            value={sessionType}
            onChange={(e) => onSessionTypeChange(e.target.value)}
            className="premium-input mt-1 w-full"
          />
        </label>
      </div>

      <ModalActions
        onClose={onClose}
        onSave={onSave}
        saving={saving}
        disabled={!scheduledDate || !scheduledTime}
        saveLabel="Schedule"
      />
    </ModalShell>
  )
}

function ModalShell({
  title,
  description,
  onClose,
  saving = false,
  closeSignal,
  children,
}: {
  title: string
  description: string
  onClose: () => void
  saving?: boolean
  closeSignal?: number
  children: ReactNode
}) {
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)
  useCloseOnSuccess(closeSignal, saving, requestClose)

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      panelClassName="max-w-lg rounded-2xl border border-white/10 bg-[#0b1224] p-6 text-white shadow-xl"
      backdropClassName="bg-black/70"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={requestClose}
          className="rounded-xl border border-white/10 px-3 py-1 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          Close
        </button>
      </div>
      {children}
    </AnimatedModal>
  )
}

function ModalActions({
  onClose,
  onSave,
  saving,
  disabled,
  saveLabel = "Save",
}: {
  onClose: () => void
  onSave: () => void | Promise<void>
  saving: boolean
  disabled: boolean
  saveLabel?: string
}) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        className="rounded-xl border border-white/10 px-6 py-3 text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={() => void onSave()}
        disabled={disabled || saving}
        className="btn-gradient px-6 py-3 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving…" : saveLabel}
      </button>
    </div>
  )
}

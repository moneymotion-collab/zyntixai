"use client"

import { useEffect, useState } from "react"
import {
  CLIENT_GOAL_TYPE_OPTIONS,
  type ClientGoalType,
} from "@/lib/progress/client-goals"
import AnimatedModal, { useCloseOnSuccess, useMountAnimatedModal } from "@/components/ui/animated-modal"
import { premiumInputClass, premiumSelectClass } from "@/lib/ui/premium-input"

type MemberOption = {
  id: string
  full_name: string | null
}

type CreateClientGoalModalProps = {
  members: MemberOption[]
  defaultMemberId?: string
  saving: boolean
  errorMessage: string | null
  closeSignal?: number
  onClose: () => void
  onSubmit: (input: {
    memberId: string
    title: string
    goalType: ClientGoalType
    startValue: number
    targetValue: number
    targetDate: string
  }) => void
}

const modalInputClass = premiumInputClass
const modalSelectClass = premiumSelectClass

export default function CreateClientGoalModal({
  members,
  defaultMemberId = "",
  saving,
  errorMessage,
  closeSignal,
  onClose,
  onSubmit,
}: CreateClientGoalModalProps) {
  const [memberId, setMemberId] = useState(defaultMemberId)
  const [title, setTitle] = useState("")
  const [goalType, setGoalType] = useState<ClientGoalType>("weight_loss")
  const [startValue, setStartValue] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (defaultMemberId) setMemberId(defaultMemberId)
  }, [defaultMemberId])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose, saving])

  const handleSubmit = () => {
    if (!memberId) {
      setValidationError("Select a member.")
      return
    }

    if (!title.trim()) {
      setValidationError("Enter a goal title.")
      return
    }

    const start = Number(startValue)
    const target = Number(targetValue)

    if (startValue === "" || Number.isNaN(start)) {
      setValidationError("Enter a valid start value.")
      return
    }

    if (targetValue === "" || Number.isNaN(target)) {
      setValidationError("Enter a valid target value.")
      return
    }

    if (!targetDate) {
      setValidationError("Select a target date.")
      return
    }

    setValidationError(null)
    onSubmit({
      memberId,
      title: title.trim(),
      goalType,
      startValue: start,
      targetValue: target,
      targetDate,
    })
  }

  const displayError = validationError ?? errorMessage
  const minDate = new Date().toISOString().slice(0, 10)
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)
  useCloseOnSuccess(closeSignal, saving, requestClose)

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="create-client-goal-title"
      panelClassName="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#0b1224] p-6 text-white shadow-2xl"
      backdropClassName="bg-black/70 backdrop-blur-sm"
    >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-violet-400">
              Goals tracking
            </p>
            <h2 id="create-client-goal-title" className="mt-2 text-2xl font-bold">
              Create goal
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Progress syncs automatically from client check-in weight data.
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            className="rounded-xl border border-white/10 px-3 py-1 text-sm text-gray-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
          >
            Close
          </button>
        </div>

        {displayError ? (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {displayError}
          </p>
        ) : null}

        <div className="space-y-4">
          <ModalField label="Member">
            <select
              value={memberId}
              onChange={(event) => setMemberId(event.target.value)}
              disabled={saving}
              className={modalSelectClass}
            >
              <option value="">
                Select member
              </option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name ?? "Member"}
                </option>
              ))}
            </select>
          </ModalField>

          <ModalField label="Goal title">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Summer cut phase"
              disabled={saving}
              className={modalInputClass}
            />
          </ModalField>

          <ModalField label="Goal type">
            <select
              value={goalType}
              onChange={(event) =>
                setGoalType(event.target.value as ClientGoalType)
              }
              disabled={saving}
              className={modalSelectClass}
            >
              {CLIENT_GOAL_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </ModalField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ModalField label="Start value">
              <input
                type="number"
                step="any"
                value={startValue}
                onChange={(event) => setStartValue(event.target.value)}
                placeholder="e.g. 82"
                disabled={saving}
                className={modalInputClass}
              />
            </ModalField>

            <ModalField label="Target value">
              <input
                type="number"
                step="any"
                value={targetValue}
                onChange={(event) => setTargetValue(event.target.value)}
                placeholder="e.g. 75"
                disabled={saving}
                className={modalInputClass}
              />
            </ModalField>
          </div>

          <ModalField label="Target date">
            <input
              type="date"
              value={targetDate}
              min={minDate}
              onChange={(event) => setTargetDate(event.target.value)}
              disabled={saving}
              className={modalInputClass}
            />
          </ModalField>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            className="rounded-xl border border-white/10 px-6 py-3 text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || members.length === 0}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-medium text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create goal"}
          </button>
        </div>
    </AnimatedModal>
  )
}

function ModalField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-400">{label}</span>
      {children}
    </label>
  )
}

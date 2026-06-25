"use client"

import { useEffect, useState } from "react"
import SaasEmptyState from "@/components/ui/saas-empty-state"
import AnimatedModal, { useCloseOnSuccess, useMountAnimatedModal } from "@/components/ui/animated-modal"
import {
  METRIC_LOG_OPTIONS,
  type MetricLogCategory,
} from "@/lib/progress/metrics"
import { premiumInputClass, premiumSelectClass } from "@/lib/ui/premium-input"

type MemberOption = {
  id: string
  full_name: string | null
}

type AddProgressLogModalProps = {
  members: MemberOption[]
  isMember: boolean
  lockedMemberId?: string
  saving: boolean
  errorMessage: string | null
  closeSignal?: number
  onClose: () => void
  onSubmit: (input: {
    memberId: string
    metricCategory: MetricLogCategory
    customMetricName?: string
    startValue: number
    currentValue: number
  }) => void | Promise<void>
}

export default function AddProgressLogModal({
  members,
  isMember,
  lockedMemberId,
  saving,
  errorMessage,
  closeSignal,
  onClose,
  onSubmit,
}: AddProgressLogModalProps) {
  const [memberId, setMemberId] = useState(lockedMemberId ?? "")
  const [metricCategory, setMetricCategory] = useState<MetricLogCategory>("weight")
  const [customMetricName, setCustomMetricName] = useState("")
  const [startValue, setStartValue] = useState("")
  const [currentValue, setCurrentValue] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (lockedMemberId) {
      setMemberId(lockedMemberId)
    }
  }, [lockedMemberId])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onClose, saving])

  const handleSubmit = async () => {
    const targetMemberId = isMember ? lockedMemberId : memberId

    if (!targetMemberId) {
      setValidationError("Select a member.")
      return
    }

    if (metricCategory === "custom" && !customMetricName.trim()) {
      setValidationError("Enter a name for the custom metric.")
      return
    }

    const start = Number(startValue)
    const current = Number(currentValue)

    if (startValue === "" || Number.isNaN(start)) {
      setValidationError("Enter a valid start value.")
      return
    }

    if (currentValue === "" || Number.isNaN(current)) {
      setValidationError("Enter a valid current value.")
      return
    }

    setValidationError(null)
    await onSubmit({
      memberId: targetMemberId,
      metricCategory,
      customMetricName:
        metricCategory === "custom" ? customMetricName.trim() : undefined,
      startValue: start,
      currentValue: current,
    })
  }

  const displayError = validationError ?? errorMessage
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)
  useCloseOnSuccess(closeSignal, saving, requestClose)

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="add-progress-log-title"
      panelClassName="max-w-lg rounded-3xl border border-white/10 bg-[#0b1224] p-6 text-white shadow-2xl"
      backdropClassName="bg-black/70 backdrop-blur-sm"
    >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-cyan-400">
              Progress Dashboard Pro
            </p>
            <h2 id="add-progress-log-title" className="mt-2 text-2xl font-bold">
              Add progress log
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Record a new measurement for a member.
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
          {!isMember ? (
            <ModalField label="Member">
              {members.length === 0 ? (
                <SaasEmptyState
                  preset="workoutMembersRequired"
                  compact
                  showAction={false}
                />
              ) : (
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  disabled={saving}
                  className={modalSelectClass}
                >
                  <option value="">
                    Select member
                  </option>
                  {members.map((member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.full_name ?? "Member"}
                    </option>
                  ))}
                </select>
              )}
            </ModalField>
          ) : null}

          <ModalField label="Metric">
            <select
              value={metricCategory}
              onChange={(e) =>
                setMetricCategory(e.target.value as MetricLogCategory)
              }
              disabled={saving}
              className={modalSelectClass}
            >
              {METRIC_LOG_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </ModalField>

          {metricCategory === "custom" ? (
            <ModalField label="Custom metric name">
              <input
                type="text"
                value={customMetricName}
                onChange={(e) => setCustomMetricName(e.target.value)}
                placeholder="e.g. Sleep score, Mobility index"
                disabled={saving}
                className={modalInputClass}
              />
            </ModalField>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <ModalField label="Start value">
              <input
                type="number"
                step="any"
                value={startValue}
                onChange={(e) => setStartValue(e.target.value)}
                placeholder="0"
                disabled={saving}
                className={modalInputClass}
              />
            </ModalField>

            <ModalField label="Current value">
              <input
                type="number"
                step="any"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="0"
                disabled={saving}
                className={modalInputClass}
              />
            </ModalField>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            className="inline-flex min-h-11 items-center rounded-xl border border-white/10 px-6 py-3 text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={
              saving ||
              (!isMember && (members.length === 0 || !memberId)) ||
              (isMember && !lockedMemberId)
            }
            className="inline-flex min-h-11 items-center rounded-xl bg-cyan-500 px-6 py-3 font-medium text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save progress log"}
          </button>
        </div>
    </AnimatedModal>
  )
}

const modalInputClass = premiumInputClass
const modalSelectClass = premiumSelectClass

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

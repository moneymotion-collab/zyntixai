"use client"

import { Loader2 } from "lucide-react"
import AnimatedModal, { useMountAnimatedModal } from "@/components/ui/animated-modal"

type ConfirmDialogProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialogBody({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onClose,
}: Omit<ConfirmDialogProps, "open" | "onCancel"> & { onClose: () => void }) {
  const { open, requestClose, onExitComplete } = useMountAnimatedModal(onClose)

  return (
    <AnimatedModal
      open={open}
      onClose={requestClose}
      onExitComplete={onExitComplete}
      ariaLabelledBy="confirm-dialog-title"
      panelClassName="max-w-md rounded-3xl border bg-white p-6 shadow-xl"
      backdropClassName="bg-black/40"
    >
      <h2
        id="confirm-dialog-title"
        className="text-lg font-semibold text-gray-900"
      >
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{message}</p>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={requestClose}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting…
            </>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </AnimatedModal>
  )
}

export default function ConfirmDialog({
  open,
  onCancel,
  ...props
}: ConfirmDialogProps) {
  if (!open) return null

  return <ConfirmDialogBody {...props} onClose={onCancel} />
}

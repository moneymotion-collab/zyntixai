"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { MOBILE_MODAL_PANEL, MOBILE_MODAL_ROOT } from "@/lib/ui/mobile-layout"

const EASE = [0.25, 0.1, 0.25, 1] as const

type AnimatedModalProps = {
  open: boolean
  onClose: () => void
  onExitComplete?: () => void
  children: ReactNode
  className?: string
  panelClassName?: string
  backdropClassName?: string
  closeOnBackdrop?: boolean
  ariaLabelledBy?: string
  ariaDescribedBy?: string
}

export function useMountAnimatedModal(onClose: () => void) {
  const [open, setOpen] = useState(true)

  return {
    open,
    requestClose: () => setOpen(false),
    onExitComplete: onClose,
  }
}

/** Animate modal close after async parent save completes (avoids abrupt unmount). */
export function useCloseOnSuccess(
  closeSignal: number | undefined,
  saving: boolean,
  requestClose: () => void,
) {
  const handledSignal = useRef(0)
  const mountSignal = useRef(closeSignal ?? 0)

  useEffect(() => {
    if (
      closeSignal !== undefined &&
      closeSignal > mountSignal.current &&
      closeSignal !== handledSignal.current &&
      !saving
    ) {
      handledSignal.current = closeSignal
      requestClose()
    }
  }, [closeSignal, saving, requestClose])
}

export default function AnimatedModal({
  open,
  onClose,
  onExitComplete,
  children,
  className = MOBILE_MODAL_ROOT,
  panelClassName = "",
  backdropClassName = "bg-black/60",
  closeOnBackdrop = true,
  ariaLabelledBy,
  ariaDescribedBy,
}: AnimatedModalProps) {
  const prefersReducedMotion = useReducedMotion()

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: EASE }

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open ? (
        <motion.div
          key="modal-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={
            prefersReducedMotion
              ? { opacity: 1 }
              : { opacity: 0, scale: 0.98, y: 4 }
          }
          transition={transition}
          className={`fixed inset-0 z-50 ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        >
          <button
            type="button"
            className={`absolute inset-0 ${backdropClassName}`}
            aria-label="Close dialog"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.95, y: 8 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              prefersReducedMotion
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.97, y: 6 }
            }
            transition={transition}
            className={`relative z-10 w-full ${MOBILE_MODAL_PANEL} ${panelClassName}`.trim()}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

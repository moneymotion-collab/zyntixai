"use client"

import { useEffect, useState } from "react"
import {
  DEMO_PRODUCT_TOUR_TOTAL,
  getTourStepByIndex,
  readDemoProductTourState,
  writeDemoProductTourState,
  type DemoProductTourState,
} from "@/lib/tour/demo-product-tour"

type UseDemoProductTourOptions = {
  enabled: boolean
}

export function useDemoProductTour({ enabled }: UseDemoProductTourOptions) {
  const [state, setState] = useState<DemoProductTourState | null>(null)
  const [hydrated, setHydrated] = useState(!enabled)

  useEffect(() => {
    let active = true

    if (!enabled) {
      setState(null)
      setHydrated(true)
      return () => {
        active = false
      }
    }

    const existing = readDemoProductTourState()
    const initial: DemoProductTourState = existing ?? {
      step: 1,
      completed: false,
      skipped: false,
    }

    if (!existing) {
      writeDemoProductTourState(initial)
    }

    if (active) {
      setState(initial)
      setHydrated(true)
    }

    return () => {
      active = false
    }
  }, [enabled])

  const persist = (next: DemoProductTourState) => {
    writeDemoProductTourState(next)
    setState(next)
  }

  const isActive = Boolean(
    enabled && hydrated && state && !state.completed && !state.skipped,
  )

  const currentStep = state?.step ?? 1
  const stepConfig = getTourStepByIndex(currentStep)

  const next = () => {
    if (!state) return

    if (currentStep >= DEMO_PRODUCT_TOUR_TOTAL) {
      persist({ ...state, completed: true })
      return
    }

    persist({ ...state, step: currentStep + 1 })
  }

  const previous = () => {
    if (!state || currentStep <= 1) return
    persist({ ...state, step: currentStep - 1 })
  }

  const skip = () => {
    if (!state) return
    persist({ ...state, skipped: true, completed: true })
  }

  return {
    hydrated,
    isActive,
    currentStep,
    stepConfig,
    totalSteps: DEMO_PRODUCT_TOUR_TOTAL,
    next,
    previous,
    skip,
    canGoPrevious: currentStep > 1,
    isLastStep: currentStep >= DEMO_PRODUCT_TOUR_TOTAL,
  }
}

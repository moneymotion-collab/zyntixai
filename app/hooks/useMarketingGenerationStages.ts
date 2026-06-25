"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export function useMarketingGenerationStages(
  stageCount: number,
  intervalMs = 1400,
) {
  const [activeStep, setActiveStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const start = useCallback(() => {
    clearTimer()
    setActiveStep(0)
    setIsRunning(true)

    timerRef.current = setInterval(() => {
      setActiveStep((current) =>
        current < stageCount - 1 ? current + 1 : current,
      )
    }, intervalMs)
  }, [clearTimer, intervalMs, stageCount])

  const stop = useCallback(() => {
    clearTimer()
    setActiveStep(stageCount)
    setIsRunning(false)
  }, [clearTimer, stageCount])

  const reset = useCallback(() => {
    clearTimer()
    setActiveStep(0)
    setIsRunning(false)
  }, [clearTimer])

  return {
    activeStep,
    isRunning,
    start,
    stop,
    reset,
  }
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export function useVideoSceneProgress(sceneCount: number, intervalMs = 1800) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const effectiveCount = Math.max(sceneCount, 1)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  const start = useCallback(() => {
    clearTimer()
    setActiveSceneIndex(0)
    setIsRunning(true)

    timerRef.current = setInterval(() => {
      setActiveSceneIndex((current) =>
        current < effectiveCount - 1 ? current + 1 : current,
      )
    }, intervalMs)
  }, [clearTimer, effectiveCount, intervalMs])

  const stop = useCallback(() => {
    clearTimer()
    setActiveSceneIndex(effectiveCount)
    setIsRunning(false)
  }, [clearTimer, effectiveCount])

  const reset = useCallback(() => {
    clearTimer()
    setActiveSceneIndex(0)
    setIsRunning(false)
  }, [clearTimer])

  return {
    activeSceneIndex,
    isRunning,
    start,
    stop,
    reset,
  }
}

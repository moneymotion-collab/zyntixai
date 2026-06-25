"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import DemoProductTour from "@/components/tour/DemoProductTour"
import { useDemoProductTour } from "@/app/hooks/useDemoProductTour"
import { useIsDemoWorkspace } from "@/app/hooks/useIsDemoWorkspace"
import { isPublicAppPath } from "@/lib/navigation/is-public-path"
import { pathMatchesTourStep } from "@/lib/tour/demo-product-tour"

type SpotlightRect = {
  top: number
  left: number
  width: number
  height: number
}

export default function DemoProductTourHost() {
  const pathname = usePathname()
  const { isDemoWorkspace, loading: demoLoading } = useIsDemoWorkspace()
  const navigationStartedRef = useRef(false)

  const tourEnabled =
    isDemoWorkspace && !isPublicAppPath(pathname) && !demoLoading

  const tour = useDemoProductTour({ enabled: tourEnabled })
  const [targetRect, setTargetRect] = useState<SpotlightRect | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
      navigationStartedRef.current = false
    }
  }, [])

  const updateTargetRect = useCallback(() => {
    if (!tour.stepConfig) {
      setTargetRect(null)
      return
    }

    const element = document.querySelector(tour.stepConfig.target)
    if (!element) {
      setTargetRect(null)
      return
    }

    const rect = element.getBoundingClientRect()
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    })
  }, [tour.stepConfig])

  useEffect(() => {
    if (!mounted || !tour.isActive || !tour.stepConfig) {
      return
    }

    const matches = pathMatchesTourStep(pathname, tour.stepConfig.href)
    if (!matches && !navigationStartedRef.current) {
      navigationStartedRef.current = true
      window.location.assign(tour.stepConfig.href)
    }
  }, [mounted, tour.isActive, tour.stepConfig, pathname])

  useEffect(() => {
    if (!mounted || !tour.isActive || navigationStartedRef.current) {
      return
    }

    updateTargetRect()

    const timer = window.setTimeout(updateTargetRect, 350)

    window.addEventListener("resize", updateTargetRect)
    window.addEventListener("scroll", updateTargetRect, true)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("resize", updateTargetRect)
      window.removeEventListener("scroll", updateTargetRect, true)
    }
  }, [mounted, tour.isActive, tour.currentStep, pathname, updateTargetRect])

  if (
    !mounted ||
    !tour.isActive ||
    !tour.stepConfig ||
    navigationStartedRef.current
  ) {
    return null
  }

  if (!pathMatchesTourStep(pathname, tour.stepConfig.href)) {
    return null
  }

  return (
    <DemoProductTour
      step={tour.stepConfig}
      currentStep={tour.currentStep}
      totalSteps={tour.totalSteps}
      targetRect={targetRect}
      canGoPrevious={tour.canGoPrevious}
      isLastStep={tour.isLastStep}
      onNext={tour.next}
      onPrevious={tour.previous}
      onSkip={tour.skip}
    />
  )
}

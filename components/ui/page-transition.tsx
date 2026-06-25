"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

const PAGE_ENTER = {
  opacity: 0,
  y: 10,
} as const

const PAGE_VISIBLE = {
  opacity: 1,
  y: 0,
} as const

const PAGE_EXIT = {
  opacity: 0,
  y: -6,
} as const

const EASE = [0.25, 0.1, 0.25, 1] as const

type PageTransitionProps = {
  children: ReactNode
  routeKey: string
}

export default function PageTransition({ children, routeKey }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion()

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: EASE }

  return (
    <motion.div
      key={routeKey}
      initial={prefersReducedMotion ? PAGE_VISIBLE : PAGE_ENTER}
      animate={PAGE_VISIBLE}
      exit={prefersReducedMotion ? PAGE_VISIBLE : PAGE_EXIT}
      transition={transition}
      className="min-w-0"
    >
      {children}
    </motion.div>
  )
}

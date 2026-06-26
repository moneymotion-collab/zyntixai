"use client"

import type { ReactNode } from "react"
import type { SaasEmptyCopy } from "@/lib/copy/saas-empty-states"
import EmptyState from "@/components/ui/empty-state"

type ProgressEmptyStateProps = SaasEmptyCopy & {
  icon?: ReactNode
  action?: ReactNode
  compact?: boolean
}

/** @deprecated Use `EmptyState` with `style="dashed"` — kept for progress module compatibility */
export default function ProgressEmptyState(props: ProgressEmptyStateProps) {
  return (
    <EmptyState
      {...props}
      variant="dark"
      style="dashed"
    />
  )
}

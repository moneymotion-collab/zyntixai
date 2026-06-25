import type { ReactNode } from "react"
import EmptyState from "@/components/ui/empty-state"
import {
  EMPTY_STATE_ICONS,
  renderEmptyStateAction,
  type SaasEmptyPreset,
} from "@/lib/copy/empty-state-presets"
import { SAAS_EMPTY, type SaasEmptyCopy } from "@/lib/copy/saas-empty-states"

type SaasEmptyStateProps = {
  preset: SaasEmptyPreset
  variant?: "dark" | "light"
  compact?: boolean
  icon?: ReactNode
  action?: ReactNode
  showAction?: boolean
} & Partial<SaasEmptyCopy>

export default function SaasEmptyState({
  preset,
  variant = "dark",
  compact = false,
  icon,
  action,
  showAction = true,
  ...overrides
}: SaasEmptyStateProps) {
  const copy = { ...SAAS_EMPTY[preset], ...overrides }
  const resolvedIcon = icon ?? EMPTY_STATE_ICONS[preset]
  const resolvedAction =
    action ?? (showAction ? renderEmptyStateAction(preset, variant) : null)

  return (
    <EmptyState
      {...copy}
      variant={variant}
      compact={compact}
      icon={resolvedIcon}
      action={resolvedAction}
    />
  )
}

import { type ReactNode } from "react"

const statusStyles: Record<string, string> = {
  active: "badge-active",
  pending: "badge-pending",
  completed: "badge-completed",
  paused: "badge-equipment",
}

type BadgeProps = {
  children: ReactNode
  status?: string
  variant?:
    | "muscle"
    | "equipment"
    | "category"
    | "beginner"
    | "intermediate"
    | "advanced"
    | "default"
  className?: string
}

const variantStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  muscle: "badge-muscle",
  equipment: "badge-equipment",
  category: "badge-category",
  beginner: "badge-beginner",
  intermediate: "badge-intermediate",
  advanced: "badge-advanced",
  default: "badge-soft border-white/10 bg-white/[0.05] text-slate-300",
}

export default function Badge({
  children,
  status,
  variant = "default",
  className = "",
}: BadgeProps) {
  const statusClass =
    status != null ? (statusStyles[status] ?? variantStyles.default) : variantStyles[variant]

  return (
    <span className={`${statusClass} ${className}`.trim()}>{children}</span>
  )
}

export function difficultyBadgeVariant(
  difficulty: string,
): NonNullable<BadgeProps["variant"]> {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "beginner"
    case "advanced":
      return "advanced"
    default:
      return "intermediate"
  }
}

import { type ReactNode } from "react"

type GlassCardProps = {
  children: ReactNode
  className?: string
  hover?: boolean | "stat"
  active?: boolean
  as?: "div" | "article" | "section" | "aside"
  id?: string
}

export default function GlassCard({
  children,
  className = "",
  hover = false,
  active = false,
  as: Tag = "div",
  id,
}: GlassCardProps) {
  const hoverClass =
    hover === "stat"
      ? "stat-card-hover"
      : hover
        ? "dashboard-card-hover"
        : ""

  return (
    <Tag
      id={id}
      className={`glass-panel ${hoverClass} ${active ? "glass-panel-active" : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  )
}

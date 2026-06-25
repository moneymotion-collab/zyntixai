import { type HTMLAttributes, type ReactNode } from "react"
import { fitcoreCardClass } from "@/lib/ui/fitcore-form"

type CardVariant = "light" | "dark"

const variantClasses: Record<CardVariant, string> = {
  light: `${fitcoreCardClass} p-6`,
  dark: "rounded-2xl border border-zinc-800 bg-card p-8",
}

export default function Card({
  children,
  className = "",
  variant = "dark",
}: {
  children: ReactNode
  className?: string
  variant?: CardVariant
}) {
  return (
    <div className={`${variantClasses[variant]} ${className}`.trim()}>
      {children}
    </div>
  )
}

export function CardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`.trim()} {...props} />
}

export function CardTitle({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={`text-2xl font-bold tracking-tight text-black ${className}`.trim()}
      {...props}
    />
  )
}

export function CardContent({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />
}

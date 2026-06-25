"use client"

import {
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react"
import ButtonSpinner from "@/components/ui/button-spinner"
import {
  fitcoreBtnPrimaryClass,
  fitcoreBtnSecondaryClass,
} from "@/lib/ui/fitcore-form"

export const PRIMARY_BUTTON_CLASS = "btn-gradient"

type ButtonVariant = "primary" | "outline" | "default" | "secondary" | "solid"
type ButtonSize = "default" | "sm"

const variantClasses: Record<ButtonVariant, string> = {
  primary: PRIMARY_BUTTON_CLASS,
  default: PRIMARY_BUTTON_CLASS,
  outline: "btn-ghost",
  secondary: fitcoreBtnSecondaryClass,
  solid: fitcoreBtnPrimaryClass,
}

const sizeClasses: Record<ButtonSize, string> = {
  default: "",
  sm: "px-3 py-1.5 text-xs",
}

export default function Button({
  children,
  variant = "primary",
  size = "default",
  className = "",
  loading = false,
  disabled,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
      {...props}
    >
      {loading ? <ButtonSpinner /> : null}
      <span>{children}</span>
    </button>
  )
}

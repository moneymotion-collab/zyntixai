"use client"

import { forwardRef, type InputHTMLAttributes } from "react"
import { fitcoreInputClass } from "@/lib/ui/fitcore-form"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={`${fitcoreInputClass} ${className}`.trim()}
      {...props}
    />
  ),
)

Input.displayName = "Input"

export default Input

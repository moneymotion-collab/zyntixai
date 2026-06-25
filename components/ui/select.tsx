"use client"

import { forwardRef, type SelectHTMLAttributes } from "react"
import { fitcoreSelectClass } from "@/lib/ui/fitcore-form"

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => (
    <select
      ref={ref}
      className={`${fitcoreSelectClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  ),
)

Select.displayName = "Select"

export default Select

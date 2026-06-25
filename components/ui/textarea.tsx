"use client"

import { forwardRef, type TextareaHTMLAttributes } from "react"
import { fitcoreTextareaClass } from "@/lib/ui/fitcore-form"

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={`${fitcoreTextareaClass} min-h-24 resize-y ${className}`.trim()}
      {...props}
    />
  ),
)

Textarea.displayName = "Textarea"

export default Textarea

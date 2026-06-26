import type { ReactNode } from "react"

import {
  saasFieldErrorClass,
  saasFieldSuccessClass,
  saasHelperClass,
  saasLabelClass,
} from "@/lib/ui/saas-tokens"

type FormFieldProps = {
  id: string
  label: string
  children: ReactNode
  helper?: string
  error?: string | null
  success?: string | null
  required?: boolean
  className?: string
}

export default function FormField({
  id,
  label,
  children,
  helper,
  error,
  success,
  required = false,
  className = "",
}: FormFieldProps) {
  const describedBy = [
    helper ? `${id}-helper` : null,
    error ? `${id}-error` : null,
    success ? `${id}-success` : null,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={className}>
      <label htmlFor={id} className={saasLabelClass}>
        {label}
        {required ? (
          <span className="ml-1 text-red-400" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <div aria-describedby={describedBy || undefined}>{children}</div>
      {helper ? (
        <p id={`${id}-helper`} className={saasHelperClass}>
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className={saasFieldErrorClass} role="alert">
          {error}
        </p>
      ) : null}
      {!error && success ? (
        <p id={`${id}-success`} className={saasFieldSuccessClass}>
          {success}
        </p>
      ) : null}
    </div>
  )
}

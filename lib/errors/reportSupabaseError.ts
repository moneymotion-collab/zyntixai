import type { PostgrestError } from "@supabase/supabase-js"

export type ReportSupabaseErrorToast = {
  title: string
  description?: string
  variant?: "success" | "error"
}

export type ReportSupabaseErrorOptions = {
  setToast?: (toast: ReportSupabaseErrorToast) => void
  setError?: (message: string) => void
  toastTitle?: string
  fallbackMessage?: string
}

type SupabaseErrorLike =
  | PostgrestError
  | Error
  | string
  | null
  | undefined
  | { message: string }

function coerceSupabaseError(error: unknown): SupabaseErrorLike {
  if (
    error == null ||
    typeof error === "string" ||
    error instanceof Error ||
    (typeof error === "object" && "message" in error)
  ) {
    return error as SupabaseErrorLike
  }

  return String(error)
}

function extractMessage(
  error: SupabaseErrorLike,
  fallbackMessage: string,
): string {
  if (error == null) return fallbackMessage
  if (typeof error === "string") {
    const trimmed = error.trim()
    return trimmed || fallbackMessage
  }
  if (typeof error === "object" && "message" in error) {
    const trimmed = String(error.message).trim()
    return trimmed || fallbackMessage
  }
  return fallbackMessage
}

export function reportSupabaseError(
  context: string,
  error: unknown,
  options: ReportSupabaseErrorOptions = {},
): string {
  const {
    setToast,
    setError,
    toastTitle,
    fallbackMessage = "Something went wrong. Please try again.",
  } = options

  const message = extractMessage(coerceSupabaseError(error), fallbackMessage)

  console.error(context, error)

  if (setError) {
    setError(message)
  }

  if (setToast) {
    const title = toastTitle ?? message
    setToast({
      title,
      description: toastTitle && message !== toastTitle ? message : undefined,
      variant: "error",
    })
  }

  return message
}

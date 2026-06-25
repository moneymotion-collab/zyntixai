import { Loader2 } from "lucide-react"

type ButtonSpinnerProps = {
  className?: string
}

export default function ButtonSpinner({
  className = "h-4 w-4",
}: ButtonSpinnerProps) {
  return <Loader2 className={`shrink-0 animate-spin ${className}`} aria-hidden />
}

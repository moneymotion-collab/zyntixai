import { Suspense } from "react"
import RegisterPageClient from "./RegisterPageClient"

function RegisterFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-400">
      Loading…
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterPageClient />
    </Suspense>
  )
}

import { Suspense } from "react"
import LoginPageClient from "./LoginPageClient"

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-gray-400">
      Loading…
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageClient />
    </Suspense>
  )
}

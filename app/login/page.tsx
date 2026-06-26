import { Suspense } from "react"
import BrandedLoadingState from "@/components/brand/BrandedLoadingState"
import LoginPageClient from "./LoginPageClient"

function LoginFallback() {
  return <BrandedLoadingState message="Loading…" variant="mark" />
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageClient />
    </Suspense>
  )
}

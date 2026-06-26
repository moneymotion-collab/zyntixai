import { Suspense } from "react"
import BrandedLoadingState from "@/components/brand/BrandedLoadingState"
import RegisterPageClient from "./RegisterPageClient"

function RegisterFallback() {
  return <BrandedLoadingState message="Loading…" variant="mark" />
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterPageClient />
    </Suspense>
  )
}

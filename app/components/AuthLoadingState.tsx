import BrandedLoadingState from "@/components/brand/BrandedLoadingState"

export default function AuthLoadingState({
  message = "Loading…",
}: {
  message?: string
}) {
  return <BrandedLoadingState message={message} variant="mark" />
}

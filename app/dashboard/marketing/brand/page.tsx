import ProtectedShell from "@/app/components/ProtectedShell"
import BrandProfile from "@/components/marketing/BrandProfile"

export default function DashboardMarketingBrandPage() {
  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <BrandProfile />
    </ProtectedShell>
  )
}

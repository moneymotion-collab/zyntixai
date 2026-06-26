import ProtectedShell from "@/app/components/ProtectedShell"
import MarketingBrandSettings from "@/components/marketing/MarketingBrandSettings"

export default function MarketingSettingsPage() {
  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <MarketingBrandSettings
        title="Marketing Settings"
        description="Tell ZyntixAI about your gym so content ideas match your brand and goals."
        saveSuccessMessage="Marketing settings saved."
      />
    </ProtectedShell>
  )
}

import type { AutopilotStrategy } from "@/lib/marketing/autopilot-types"

export type GrowthAutopilotResponse = {
  success?: boolean
  brand_id?: string
  autopilot?: AutopilotStrategy
  error?: string
  raw?: string
}

export async function runGrowthAutopilot(
  brandId: string,
): Promise<GrowthAutopilotResponse> {
  const res = await fetch("/api/ai-growth-autopilot", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brand_id: brandId }),
  })

  return (await res.json()) as GrowthAutopilotResponse
}

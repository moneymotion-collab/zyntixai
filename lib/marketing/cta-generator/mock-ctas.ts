import type { CtaGeneratorItem } from "@/lib/marketing/cta-generator/types"

export const MOCK_CTA_LIBRARY: CtaGeneratorItem[] = [
  {
    text: "Start Your Coaching Business With AI",
    category: "Business Launch",
  },
  {
    text: "Join The FitCore AI Beta",
    category: "Early Access",
  },
  {
    text: "Run Your Entire Coaching Business In One Platform",
    category: "Platform Value",
  },
  {
    text: "Start Your Free Trial Today",
    category: "Free Trial",
  },
  {
    text: "Book Your Demo Now",
    category: "Direct Action",
  },
]

export function buildMockCtaGenerator(
  campaignName: string,
  brandName?: string,
): CtaGeneratorItem[] {
  const brand = brandName?.trim() || "FitCore AI"
  const campaign = campaignName.trim()

  return MOCK_CTA_LIBRARY.map((cta) => ({
    ...cta,
    text: personalizeMockCta(cta.text, brand, campaign),
  }))
}

function personalizeMockCta(
  text: string,
  brand: string,
  campaign: string,
): string {
  const replacements: Record<string, string> = {
    "Join The FitCore AI Beta": `Join The ${brand} Beta`,
  }

  if (campaign && text === "Start Your Coaching Business With AI") {
    return `Start ${campaign} With AI`
  }

  return replacements[text] ?? text
}

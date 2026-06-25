import { buildLandingSoftwareApplicationJsonLd } from "@/lib/seo/landing-json-ld"

export default function LandingJsonLd() {
  const jsonLd = buildLandingSoftwareApplicationJsonLd()

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

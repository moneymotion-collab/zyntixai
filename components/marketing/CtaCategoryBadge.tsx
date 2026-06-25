import type { CtaCategory } from "@/lib/marketing/cta-generator/types"

const CTA_CATEGORY_STYLES: Record<
  CtaCategory,
  { bg: string; text: string; border: string }
> = {
  "Business Launch": {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-100",
  },
  "Early Access": {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-100",
  },
  "Platform Value": {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-100",
  },
  "Free Trial": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
  },
  "Direct Action": {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-100",
  },
}

export default function CtaCategoryBadge({
  category,
}: {
  category: CtaCategory
}) {
  const styles = CTA_CATEGORY_STYLES[category]

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {category}
    </span>
  )
}

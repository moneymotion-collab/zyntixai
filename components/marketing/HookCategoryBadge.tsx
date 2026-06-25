import type { HookCategory } from "@/lib/marketing/hook-library/types"

const HOOK_CATEGORY_STYLES: Record<
  HookCategory,
  { bg: string; text: string; border: string }
> = {
  "Pain Point": {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-100",
  },
  Curiosity: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-100",
  },
  Mistake: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-100",
  },
  Opportunity: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
  },
  Contrarian: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-100",
  },
  Results: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-100",
  },
}

export default function HookCategoryBadge({
  category,
}: {
  category: HookCategory
}) {
  const styles = HOOK_CATEGORY_STYLES[category]

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles.bg} ${styles.text} ${styles.border}`}
    >
      {category}
    </span>
  )
}

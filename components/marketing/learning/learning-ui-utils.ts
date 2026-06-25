export function priorityBadgeClass(priority: number): string {
  if (priority >= 95) return "border-red-200 bg-red-50 text-red-700"
  if (priority >= 85) return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-cyan-200 bg-cyan-50 text-cyan-700"
}

export function priorityLabel(priority: number): string {
  if (priority >= 95) return "High"
  if (priority >= 85) return "Medium"
  return "Low"
}

export function confidenceBadgeClass(score: number): string {
  if (score >= 85) return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (score >= 70) return "border-cyan-200 bg-cyan-50 text-cyan-700"
  return "border-gray-200 bg-gray-100 text-gray-700"
}

export function categoryBadgeClass(category: string): string {
  switch (category) {
    case "hook":
      return "border-violet-200 bg-violet-50 text-violet-700"
    case "cta":
      return "border-rose-200 bg-rose-50 text-rose-700"
    case "platform":
      return "border-blue-200 bg-blue-50 text-blue-700"
    case "content_type":
      return "border-indigo-200 bg-indigo-50 text-indigo-700"
    case "posting_time":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "weak_pattern":
      return "border-red-200 bg-red-50 text-red-700"
    default:
      return "border-slate-200 bg-slate-50 text-slate-700"
  }
}

export function formatCategoryLabel(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

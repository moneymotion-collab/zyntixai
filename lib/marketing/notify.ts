export const MARKETING_CORE_CHANGED_EVENT = "marketing-core-changed"

export function notifyMarketingCoreChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(MARKETING_CORE_CHANGED_EVENT))
}

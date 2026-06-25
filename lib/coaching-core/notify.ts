export const COACHING_CORE_CHANGED_EVENT = "coaching-core-changed"

export function notifyCoachingCoreChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(COACHING_CORE_CHANGED_EVENT))
}

/** Shared mobile layout tokens (MOB2) */

/** Minimum 44×44px touch target per WCAG / iOS HIG */
export const MOBILE_TAP_TARGET =
  "inline-flex min-h-11 min-w-11 items-center justify-center"

export const MOBILE_NAV_LINK =
  "flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium"

export const MOBILE_SAFE_TOP = "pt-[max(0.75rem,env(safe-area-inset-top))]"
export const MOBILE_SAFE_BOTTOM = "pb-[max(1rem,env(safe-area-inset-bottom))]"
export const MOBILE_SAFE_X = "px-[max(1rem,env(safe-area-inset-left))] sm:px-[max(1rem,env(safe-area-inset-right))]"

/** Modal shell: fits mobile viewport, scrollable content, safe-area padding */
export const MOBILE_MODAL_ROOT =
  "flex items-end justify-center overflow-y-auto overscroll-contain p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"

export const MOBILE_MODAL_PANEL =
  "max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem))] overflow-y-auto overscroll-contain"

/** Chart container heights */
export const MOBILE_CHART_HEIGHT = "h-[220px] sm:h-[280px] md:h-[300px]"

/** Page root — prevent horizontal scroll */
export const MOBILE_PAGE_ROOT = "min-w-0 overflow-x-hidden"

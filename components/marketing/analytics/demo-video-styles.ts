/** Shared sizing tuned for screen recordings and product launch demos. */

export const DEMO_SECTION_GAP = "gap-8"

export const DEMO_CHART_HEIGHT = "h-[380px]"
export const DEMO_CHART_HEIGHT_LG = "h-[420px] sm:h-[460px]"

export const DEMO_AXIS_TICK = {
  fill: "#334155",
  fontSize: 15,
  fontWeight: 700,
} as const

export const DEMO_CATEGORY_AXIS_TICK = {
  ...DEMO_AXIS_TICK,
  fontSize: 14,
} as const

export const DEMO_CHART_MARGIN = {
  top: 16,
  right: 20,
  left: 4,
  bottom: 12,
} as const

export const DEMO_BAR_MARGIN = {
  top: 12,
  right: 28,
  left: 12,
  bottom: 12,
} as const

export const DEMO_Y_AXIS_WIDTH = 64
export const DEMO_CATEGORY_AXIS_WIDTH = 176

export const DEMO_AREA_STROKE = 3.5
export const DEMO_DOT_RADIUS = 5
export const DEMO_ACTIVE_DOT_RADIUS = 7

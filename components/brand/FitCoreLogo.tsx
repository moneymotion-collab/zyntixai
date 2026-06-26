import Image from "next/image"
import Link from "next/link"
import {
  FITCORE_AI_BRAND_NAME,
  ZYNTIX_AI_LOGO_HEIGHT,
  ZYNTIX_AI_LOGO_MARK_SRC,
  ZYNTIX_AI_LOGO_SRC,
  ZYNTIX_AI_LOGO_WIDTH,
} from "@/lib/brand/fitcore-ai"

const SIZE_MAP = {
  xs: { mark: 28, fullWidth: 96 },
  sm: { mark: 36, fullWidth: 120 },
  md: { mark: 44, fullWidth: 148 },
  lg: { mark: 56, fullWidth: 180 },
  xl: { mark: 72, fullWidth: 220 },
  hero: { mark: 88, fullWidth: 280 },
} as const

export type FitCoreLogoSize = keyof typeof SIZE_MAP

type FitCoreLogoProps = {
  size?: FitCoreLogoSize
  /** `full` shows the official lockup; `mark` shows the Z icon only */
  variant?: "full" | "mark"
  /** When true, renders the full lockup (same as variant="full") */
  showWordmark?: boolean
  subtitle?: string
  href?: string
  className?: string
  wordmarkClassName?: string
  priority?: boolean
}

function resolveVariant(
  variant: "full" | "mark" | undefined,
  showWordmark: boolean,
): "full" | "mark" {
  if (variant) return variant
  return showWordmark ? "full" : "mark"
}

function fullLogoHeight(width: number): number {
  return Math.round((width * ZYNTIX_AI_LOGO_HEIGHT) / ZYNTIX_AI_LOGO_WIDTH)
}

export default function FitCoreLogo({
  size = "md",
  variant,
  showWordmark = false,
  subtitle,
  href,
  className = "",
  priority = false,
}: FitCoreLogoProps) {
  const dimensions = SIZE_MAP[size]
  const resolvedVariant = resolveVariant(variant, showWordmark)

  const logo =
    resolvedVariant === "full" ? (
      <Image
        src={ZYNTIX_AI_LOGO_SRC}
        alt={FITCORE_AI_BRAND_NAME}
        width={dimensions.fullWidth}
        height={fullLogoHeight(dimensions.fullWidth)}
        priority={priority}
        className="h-auto max-w-full object-contain"
        style={{ width: dimensions.fullWidth, height: "auto" }}
      />
    ) : (
      <Image
        src={ZYNTIX_AI_LOGO_MARK_SRC}
        alt={`${FITCORE_AI_BRAND_NAME} logo`}
        width={dimensions.mark}
        height={dimensions.mark}
        priority={priority}
        className="h-full w-full object-cover"
      />
    )

  const content = (
    <div
      className={`flex min-w-0 items-center ${resolvedVariant === "full" ? "flex-col items-start gap-0" : "gap-3"} ${className}`.trim()}
    >
      {resolvedVariant === "mark" ? (
        <div
          className="relative shrink-0 overflow-hidden rounded-xl"
          style={{ width: dimensions.mark, height: dimensions.mark }}
        >
          {logo}
        </div>
      ) : (
        logo
      )}
      {subtitle && resolvedVariant === "mark" ? (
        <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="group inline-flex min-w-0 transition-opacity hover:opacity-90"
        aria-label={FITCORE_AI_BRAND_NAME}
      >
        {content}
      </Link>
    )
  }

  return content
}

export function FitCoreLogoMark({
  size = "md",
  className = "",
  priority = false,
}: {
  size?: FitCoreLogoSize
  className?: string
  priority?: boolean
}) {
  const dimensions = SIZE_MAP[size]

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl ${className}`.trim()}
      style={{ width: dimensions.mark, height: dimensions.mark }}
    >
      <Image
        src={ZYNTIX_AI_LOGO_MARK_SRC}
        alt={`${FITCORE_AI_BRAND_NAME} logo`}
        width={dimensions.mark}
        height={dimensions.mark}
        priority={priority}
        className="h-full w-full object-cover"
      />
    </div>
  )
}

/** Full official lockup for auth, hero, and marketing surfaces */
export function ZyntixLogoFull({
  size = "hero",
  className = "",
  priority = false,
}: {
  size?: FitCoreLogoSize
  className?: string
  priority?: boolean
}) {
  const dimensions = SIZE_MAP[size]
  const height = fullLogoHeight(dimensions.fullWidth)

  return (
    <Image
      src={ZYNTIX_AI_LOGO_SRC}
      alt={FITCORE_AI_BRAND_NAME}
      width={dimensions.fullWidth}
      height={height}
      priority={priority}
      className={`h-auto max-w-full object-contain ${className}`.trim()}
      style={{ width: dimensions.fullWidth, height: "auto" }}
    />
  )
}

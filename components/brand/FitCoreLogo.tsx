import Image from "next/image"
import Link from "next/link"
import {
  FITCORE_AI_BRAND_NAME,
  FITCORE_AI_LOGO_SRC,
} from "@/lib/brand/fitcore-ai"

const SIZE_MAP = {
  xs: { box: 28, image: 28 },
  sm: { box: 36, image: 36 },
  md: { box: 44, image: 44 },
  lg: { box: 56, image: 56 },
  xl: { box: 72, image: 72 },
  hero: { box: 96, image: 96 },
} as const

export type FitCoreLogoSize = keyof typeof SIZE_MAP

type FitCoreLogoProps = {
  size?: FitCoreLogoSize
  showWordmark?: boolean
  subtitle?: string
  href?: string
  className?: string
  wordmarkClassName?: string
  priority?: boolean
}

export default function FitCoreLogo({
  size = "md",
  showWordmark = false,
  subtitle,
  href,
  className = "",
  wordmarkClassName = "",
  priority = false,
}: FitCoreLogoProps) {
  const dimensions = SIZE_MAP[size]

  const logoImage = (
    <Image
      src={FITCORE_AI_LOGO_SRC}
      alt={`${FITCORE_AI_BRAND_NAME} logo`}
      width={dimensions.image}
      height={dimensions.image}
      priority={priority}
      className="h-auto w-full object-contain"
    />
  )

  const content = (
    <div className={`flex min-w-0 items-center gap-3 ${className}`.trim()}>
      <div
        className="relative shrink-0 overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/10"
        style={{ width: dimensions.box, height: dimensions.box }}
      >
        {logoImage}
      </div>
      {showWordmark ? (
        <div className="min-w-0">
          <p
            className={`truncate font-bold tracking-tight text-white ${wordmarkClassName}`.trim()}
          >
            {FITCORE_AI_BRAND_NAME}
          </p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="group inline-flex min-w-0 transition-opacity hover:opacity-90">
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
      className={`relative shrink-0 overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/10 ${className}`.trim()}
      style={{ width: dimensions.box, height: dimensions.box }}
    >
      <Image
        src={FITCORE_AI_LOGO_SRC}
        alt={`${FITCORE_AI_BRAND_NAME} logo`}
        width={dimensions.image}
        height={dimensions.image}
        priority={priority}
        className="h-auto w-full object-contain"
      />
    </div>
  )
}

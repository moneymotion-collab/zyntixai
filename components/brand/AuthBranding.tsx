import {
  FITCORE_AI_BRAND_NAME,
  FITCORE_AI_DESCRIPTION,
  FITCORE_AI_TAGLINE,
} from "@/lib/brand/fitcore-ai"
import { FitCoreLogoMark } from "@/components/brand/FitCoreLogo"

type AuthBrandingProps = {
  formTitle?: string
  formSubtitle?: string
}

export default function AuthBranding({
  formTitle,
  formSubtitle,
}: AuthBrandingProps) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <FitCoreLogoMark size="hero" className="mb-6 shadow-lg shadow-cyan-500/10" priority />

      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
        {FITCORE_AI_BRAND_NAME}
      </p>

      <h1 className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {FITCORE_AI_TAGLINE}
      </h1>

      <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
        {FITCORE_AI_DESCRIPTION}
      </p>

      {formTitle ? (
        <>
          <h2 className="mt-8 text-2xl font-semibold tracking-tight text-white">
            {formTitle}
          </h2>
          {formSubtitle ? (
            <p className="mt-2 max-w-md text-sm text-slate-500">{formSubtitle}</p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

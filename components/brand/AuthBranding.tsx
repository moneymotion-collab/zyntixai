import { ZyntixLogoFull } from "@/components/brand/FitCoreLogo"

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
      <ZyntixLogoFull size="hero" className="mx-auto mb-6" priority />

      {formTitle ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {formTitle}
          </h1>
          {formSubtitle ? (
            <p className="mt-2 max-w-md text-sm text-slate-500">{formSubtitle}</p>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

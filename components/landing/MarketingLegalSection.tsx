type MarketingLegalSectionProps = {
  title: string
  children: React.ReactNode
}

export default function MarketingLegalSection({
  title,
  children,
}: MarketingLegalSectionProps) {
  return (
    <section className="border-t border-white/8 py-8 first:border-t-0 first:pt-0 sm:py-10">
      <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-400 sm:text-[0.9375rem]">
        {children}
      </div>
    </section>
  )
}

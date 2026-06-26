import { ZyntixLogoFull } from "@/components/brand/FitCoreLogo"
import ProtectedShell from "./ProtectedShell"

export default function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <ProtectedShell>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <ZyntixLogoFull size="sm" className="mb-6" />
          <h1 className="text-5xl font-bold">{title}</h1>
          <p className="mt-3 max-w-2xl text-gray-400">{description}</p>
        </div>
      </main>
    </ProtectedShell>
  )
}
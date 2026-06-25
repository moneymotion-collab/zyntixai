import ProtectedShell from "@/app/components/ProtectedShell"
import InstagramDemoPreview from "@/components/marketing/instagram/InstagramDemoPreview"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { fetchInstagramDemoPreview } from "@/lib/marketing/fetch-instagram-demo-preview"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, Camera, Sparkles } from "lucide-react"

export default async function InstagramDemoPreviewPage() {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return (
      <ProtectedShell allowed={["admin", "coach"]}>
        <main className="flex flex-1 items-center justify-center p-8">
          <p className="text-sm text-gray-500">
            Could not load Instagram demo preview.
          </p>
        </main>
      </ProtectedShell>
    )
  }

  const data = await fetchInstagramDemoPreview(
    supabase,
    authResult.auth.userId,
  )

  return (
    <ProtectedShell allowed={["admin", "coach"]}>
      <main className="premium-mesh min-h-full flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/marketing"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Marketing AI
          </Link>

          <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-violet-400">
                <Camera className="h-4 w-4" aria-hidden />
                Marketing AI
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Instagram Showcase
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                Show coaches exactly what their Instagram could look like with
                FitCore AI — premium profile, transformation content, and
                AI-powered performance on every post.
              </p>
            </div>
            <span className="badge-premium shrink-0 self-start sm:self-auto">
              <Sparkles className="h-3 w-3" aria-hidden />
              Launch showcase
            </span>
          </header>

          <InstagramDemoPreview data={data} />
        </div>
      </main>
    </ProtectedShell>
  )
}

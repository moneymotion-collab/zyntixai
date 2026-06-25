"use client"

import { useState } from "react"
import { Send, Sparkles, User } from "lucide-react"
import ProtectedShell from "../components/ProtectedShell"
import { aiCoachThreads } from "@/lib/fake-data"

const statusStyles: Record<string, string> = {
  "Awaiting reply": "bg-yellow-500/20 text-yellow-400",
  "Suggestion sent": "bg-blue-500/20 text-blue-300",
  Resolved: "bg-green-500/20 text-green-400",
}

const suggestions = [
  "Draft a check-in message for inactive members",
  "Generate a hypertrophy progression for Sarah",
  "Summarize this week's nutrition adherence",
  "Suggest a recovery week for the powerlifting squad",
]

export default function AiCoachPage() {
  const [prompt, setPrompt] = useState("")

  return (
    <ProtectedShell>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
              FITAI
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">AI Coach</h1>
            <p className="mt-2 text-gray-400">
              Personalized coaching messages, programming tweaks, and member nudges.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 xl:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-purple-500/15 p-3 text-purple-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ask the AI Coach</h2>
                <p className="text-sm text-gray-400">
                  Powered by your member, session, and progress data.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0b1224] p-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Build a 4-week deload plan for John Doe..."
                rows={3}
                className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Coming soon — wired up when Supabase is connected.
                </p>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:opacity-50"
                  disabled={!prompt.trim()}
                >
                  <Send className="h-4 w-4" />
                  Generate
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                Quick prompts
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPrompt(s)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-5 text-xl font-bold">Recent threads</h2>
            <div className="space-y-3">
              {aiCoachThreads.map((t) => (
                <article
                  key={t.id}
                  className="rounded-2xl border border-white/10 bg-[#0b1224] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {t.member}
                    </div>
                    <span
                      className={`shrink-0 rounded-xl px-2 py-0.5 text-[11px] ${
                        statusStyles[t.status] ?? statusStyles.Resolved
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wide text-cyan-400">
                    {t.topic}
                  </p>
                  <p className="mt-1 text-sm text-gray-300">{t.lastMessage}</p>
                  <p className="mt-2 text-right text-xs text-gray-500">
                    {t.time}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </ProtectedShell>
  )
}
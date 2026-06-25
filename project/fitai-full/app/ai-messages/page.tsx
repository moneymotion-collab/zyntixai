import ProtectedShell from "../components/ProtectedShell"
import { aiMessages } from "../../lib/fake-data"

export default function AiMessagesPage() {
  return (
    <ProtectedShell>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">AI Messages</h1>
          <p className="mt-2 text-gray-400">
            Review automated reminders, motivation, and client updates.
          </p>
        </div>

        <div className="space-y-4">
          {aiMessages.map((message) => (
            <article
              key={message.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{message.client}</h2>
                  <p className="text-sm text-cyan-400">{message.type}</p>
                </div>

                <div className="text-right text-sm">
                  <p className="text-gray-400">{message.time}</p>
                  <p className="text-green-400">{message.status}</p>
                </div>
              </div>

              <p className="rounded-2xl bg-[#111] p-4 text-gray-200">
                {message.message}
              </p>
            </article>
          ))}
        </div>
      </main>
    </ProtectedShell>
  )
}

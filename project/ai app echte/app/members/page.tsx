import { Mail, Users } from "lucide-react"
import ProtectedShell from "../components/ProtectedShell"
import Button from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

const statusStyles: Record<string, string> = {
  Active: "bg-green-500/20 text-green-400",
  Pending: "bg-yellow-500/20 text-yellow-400",
  Paused: "bg-gray-500/20 text-gray-300",
}

export const dynamic = "force-dynamic"

function formatDate(iso: string | null) {
  if (!iso) return "-"
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

export default async function MembersPage() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <ProtectedShell>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-red-400">Could not load members</h1>
          <pre className="mt-4 overflow-auto rounded-xl bg-red-500/10 p-4 text-sm text-red-300">
            {error.message}
          </pre>
        </main>
      </ProtectedShell>
    )
  }

  const members = data ?? []
  const activeCount = members.filter((m) => m.status === "Active").length
  const pendingCount = members.filter((m) => m.status === "Pending").length

  return (
    <ProtectedShell>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
              FITAI
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Members</h1>
            <p className="mt-2 text-gray-400">
              Live data from Supabase. Manage your gym members, their goals, plans, and progress.
            </p>
          </div>

          <Button>Add Member</Button>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <SummaryCard
            label="Total Members"
            value={members.length.toString()}
            accent="text-cyan-400"
          />
          <SummaryCard
            label="Active"
            value={activeCount.toString()}
            accent="text-green-400"
          />
          <SummaryCard
            label="Pending"
            value={pendingCount.toString()}
            accent="text-yellow-400"
          />
        </section>

        {members.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
            No members yet. Add your first one via the Supabase dashboard or the "Add Member" button.
          </div>
        ) : (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-[#0b1224] text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Member</th>
                    <th className="px-6 py-4 font-medium">Goal</th>
                    <th className="px-6 py-4 font-medium">Plan</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-white/5 transition hover:bg-white/5"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-white">{member.full_name}</p>
                        <p className="mt-1 flex items-center gap-2 text-gray-400">
                          <Mail className="h-3.5 w-3.5" />
                          {member.email}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-gray-300">{member.goal ?? "-"}</td>
                      <td className="px-6 py-5">
                        <span className="rounded-xl bg-cyan-500/20 px-3 py-1 text-cyan-400">
                          {member.plan ?? "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-400">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-xl px-3 py-1 ${
                            statusStyles[member.status ?? ""] ?? statusStyles.Active
                          }`}
                        >
                          {member.status ?? "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {members.map((member) => (
                <article
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-[#0b1224] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{member.full_name}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="h-3.5 w-3.5" />
                        {member.email}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-xl px-3 py-1 text-xs ${
                        statusStyles[member.status ?? ""] ?? statusStyles.Active
                      }`}
                    >
                      {member.status ?? "Active"}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-gray-500">Goal</dt>
                      <dd className="text-gray-200">{member.goal ?? "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Plan</dt>
                      <dd className="text-cyan-400">{member.plan ?? "-"}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-gray-500">Joined</dt>
                      <dd className="text-gray-300">{formatDate(member.created_at)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </ProtectedShell>
  )
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-400">{label}</p>
        <Users className={accent} />
      </div>
      <h2 className="mt-4 text-3xl font-bold sm:text-4xl">{value}</h2>
    </div>
  )
}
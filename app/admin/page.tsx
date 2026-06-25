"use client"

import Link from "next/link"
import ProtectedShell from "../components/ProtectedShell"

export default function AdminPage() {
  return (
    <ProtectedShell allowed={["admin"]}>
      <main className="flex-1 overflow-y-auto bg-[#050816] p-6 text-white">
        <div className="mb-6 rounded-2xl border border-yellow-400 bg-yellow-100 p-4">
          <h1 className="text-2xl font-bold text-black">Admin Panel</h1>
          <p className="mt-2 text-black">You have full system access.</p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">System management</h2>
          <p className="mt-2 text-zinc-400">
            Manage members, roles, and platform settings from here.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/members"
              className="rounded-xl bg-cyan-500 px-4 py-2 font-medium text-black transition hover:bg-cyan-400"
            >
              Members
            </Link>
            <Link
              href="/settings"
              className="rounded-xl border border-white/10 px-4 py-2 transition hover:bg-white/10"
            >
              Settings
            </Link>
          </div>
        </section>
      </main>
    </ProtectedShell>
  )
}

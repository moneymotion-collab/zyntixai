import Link from "next/link"
import { getRoleLabel } from "@/lib/auth/roles"

type UnauthorizedStateProps = {
  role?: string | null
  fallbackHref?: string
}

export default function UnauthorizedState({
  role,
  fallbackHref = "/dashboard",
}: UnauthorizedStateProps) {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[#050816] p-6 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 text-2xl">
          🔒
        </div>
        <h1 className="text-3xl font-bold">Access denied</h1>
        <p className="mt-3 text-zinc-400">
          Your account role
          {role ? ` (${getRoleLabel(role)})` : ""} does not have permission to
          view this page.
        </p>
        <Link
          href={fallbackHref}
          className="mt-6 inline-block rounded-2xl bg-cyan-500 px-6 py-3 font-medium text-black transition hover:bg-cyan-400"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}

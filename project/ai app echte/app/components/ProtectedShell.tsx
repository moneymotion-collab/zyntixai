"use client"

import { type ReactNode } from "react"
import AuthGate from "./AuthGate"
import Sidebar from "./Sidebar"

export default function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen bg-[#050816] text-white">
        <Sidebar />
        <div className="flex w-full min-w-0 flex-1 flex-col">
          <div className="h-16 shrink-0 lg:hidden" aria-hidden />
          {children}
        </div>
      </div>
    </AuthGate>
  )
}
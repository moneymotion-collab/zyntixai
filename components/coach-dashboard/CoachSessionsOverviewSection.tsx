"use client"

import Link from "next/link"
import {
  CalendarClock,
  CalendarDays,
  Clock,
  NotebookPen,
  User,
} from "lucide-react"
import CoachSessionQuickActions from "@/components/coach-dashboard/CoachSessionQuickActions"
import { SessionStatusBadge } from "@/components/coach-dashboard/coach-dashboard-ui"
import EmptyState from "@/components/ui/empty-state"
import GlassCard from "@/components/ui/glass-card"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import type { TodaySession } from "@/lib/coach-dashboard/types"

type CoachSessionsOverviewSectionProps = {
  todaySessions: TodaySession[]
  upcomingSessions: TodaySession[]
  onSessionUpdated?: () => void
}

export default function CoachSessionsOverviewSection({
  todaySessions,
  upcomingSessions,
  onSessionUpdated,
}: CoachSessionsOverviewSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <GlassCard className="relative overflow-hidden border-sky-500/20 bg-gradient-to-br from-sky-500/[0.06] via-white/[0.02] to-cyan-500/[0.05] p-6 sm:p-8 xl:col-span-2">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-sky-400">
              Session overview
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Today&apos;s Agenda
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              All coaching sessions scheduled for today, sorted by time.
            </p>
          </div>
          <Link
            href="/sessions"
            className="text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
          >
            Manage sessions →
          </Link>
        </div>

        {todaySessions.length === 0 ? (
          <EmptyState
            {...SAAS_EMPTY.sessionsToday}
            icon={<CalendarDays className="h-6 w-6" />}
            action={
              <Link href="/sessions?new=1" className="btn-gradient">
                Schedule Session
              </Link>
            }
          />
        ) : (
          <>
            <div className="relative hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Member</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Time</th>
                    <th className="pb-3 pr-4 font-medium">Duration</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Notes</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {todaySessions.map((session) => (
                    <TodayAgendaRow
                      key={session.id}
                      session={session}
                      onSessionUpdated={onSessionUpdated}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="relative space-y-4 lg:hidden">
              {todaySessions.map((session) => (
                <TodayAgendaCard
                  key={session.id}
                  session={session}
                  onSessionUpdated={onSessionUpdated}
                />
              ))}
            </ul>
          </>
        )}
      </GlassCard>

      <GlassCard className="relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative mb-5">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-violet-400">
            Looking ahead
          </p>
          <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
            Upcoming Sessions
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Next 5 planned sessions after today.
          </p>
        </div>

        {upcomingSessions.length === 0 ? (
          <EmptyState
            {...SAAS_EMPTY.sessionsUpcoming}
            icon={<CalendarClock className="h-6 w-6" />}
            action={
              <Link href="/sessions?new=1" className="btn-gradient">
                Schedule Session
              </Link>
            }
          />
        ) : (
          <ul className="relative space-y-3">
            {upcomingSessions.map((session) => (
              <li key={session.id}>
                <div className="glass-panel rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {session.memberName}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {session.sessionType ?? "Session"}
                      </p>
                    </div>
                    <SessionStatusBadge
                      status={session.status}
                      label={session.statusLabel}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-violet-400" aria-hidden />
                      {session.scheduledDateLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
                      {session.scheduledTime}
                    </span>
                  </div>
                  <div className="mt-4 border-t border-white/10 pt-3">
                    <CoachSessionQuickActions
                      session={session}
                      onSessionUpdated={onSessionUpdated}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  )
}

function TodayAgendaRow({
  session,
  onSessionUpdated,
}: {
  session: TodaySession
  onSessionUpdated?: () => void
}) {
  return (
    <tr className="group align-top transition hover:bg-white/[0.03]">
      <td className="py-4 pr-4">
        <Link
          href={session.memberId ? `/members/${session.memberId}` : "/sessions"}
          className="inline-flex items-center gap-1.5 font-medium text-white group-hover:text-cyan-300"
        >
          <User className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
          {session.memberName}
        </Link>
      </td>
      <td className="py-4 pr-4 text-slate-300">{session.sessionType ?? "Session"}</td>
      <td className="py-4 pr-4 text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
          {session.scheduledTime}
        </span>
      </td>
      <td className="py-4 pr-4 text-slate-300">
        {session.duration ? `${session.duration} min` : "—"}
      </td>
      <td className="py-4 pr-4">
        <SessionStatusBadge status={session.status} label={session.statusLabel} />
      </td>
      <td className="max-w-[180px] py-4 pr-4 text-slate-400">
        {session.notes ? (
          <span className="inline-flex items-start gap-1.5">
            <NotebookPen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" aria-hidden />
            <span className="line-clamp-2">{session.notes}</span>
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="py-4">
        <CoachSessionQuickActions
          session={session}
          onSessionUpdated={onSessionUpdated}
          layout="stack"
        />
      </td>
    </tr>
  )
}

function TodayAgendaCard({
  session,
  onSessionUpdated,
}: {
  session: TodaySession
  onSessionUpdated?: () => void
}) {
  return (
    <li>
      <div className="glass-panel rounded-2xl p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-white">{session.memberName}</p>
            <p className="mt-1 text-sm text-slate-400">
              {session.sessionType ?? "Session"}
            </p>
          </div>
          <SessionStatusBadge status={session.status} label={session.statusLabel} />
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan-400" aria-hidden />
            {session.scheduledTime}
          </span>
          <span>{session.duration ? `${session.duration} min` : "—"}</span>
        </div>
        {session.notes ? (
          <p className="mt-3 flex items-start gap-2 text-sm text-slate-400">
            <NotebookPen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" aria-hidden />
            {session.notes}
          </p>
        ) : null}
        <div className="mt-4 border-t border-white/10 pt-4">
          <CoachSessionQuickActions
            session={session}
            onSessionUpdated={onSessionUpdated}
          />
        </div>
      </div>
    </li>
  )
}

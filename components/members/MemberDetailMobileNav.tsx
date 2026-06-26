"use client"

import Link from "next/link"
import {
  buildAiCoachUrl,
  buildAssignWorkoutUrl,
  buildMarketingContentUrl,
  buildNutritionUrl,
  buildProgressMemberUrl,
  buildScheduleSessionUrl,
} from "@/lib/coach-dashboard/coach-action-links"

const SECTIONS = [
  { id: "member-workouts", label: "Workouts" },
  { id: "member-goals", label: "Goals" },
  { id: "member-checkins", label: "Check-ins" },
  { id: "member-habits", label: "Habits" },
  { id: "member-photos", label: "Photos" },
  { id: "member-notes", label: "Notes" },
  { id: "member-plans", label: "Plans" },
] as const

type MemberDetailSectionNavProps = {
  memberId: string
}

export default function MemberDetailSectionNav({
  memberId,
}: MemberDetailSectionNavProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildAssignWorkoutUrl(memberId)}
          className="btn-gradient !min-h-9 !px-3 !py-2 !text-xs"
        >
          Assign workout
        </Link>
        <Link
          href={buildNutritionUrl(memberId)}
          className="fitcore-btn-secondary !min-h-9 !px-3 !py-2 !text-xs"
        >
          Nutrition plan
        </Link>
        <Link
          href={buildProgressMemberUrl(memberId)}
          className="fitcore-btn-secondary !min-h-9 !px-3 !py-2 !text-xs"
        >
          Progress
        </Link>
        <Link
          href={buildScheduleSessionUrl(memberId)}
          className="fitcore-btn-secondary !min-h-9 !px-3 !py-2 !text-xs"
        >
          Schedule session
        </Link>
        <Link
          href={buildAiCoachUrl(memberId)}
          className="fitcore-btn-secondary !min-h-9 !px-3 !py-2 !text-xs"
        >
          AI Coach
        </Link>
        <Link
          href={buildMarketingContentUrl()}
          className="fitcore-btn-secondary !min-h-9 !px-3 !py-2 !text-xs"
        >
          Marketing
        </Link>
      </div>

      <nav
        aria-label="Jump to section"
        className="-mx-1 overflow-x-auto overscroll-x-contain"
      >
        <ul className="flex min-w-max gap-2 px-1 pb-1">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="inline-flex min-h-9 items-center whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-violet-300 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/** Back-compat alias */
export function MemberDetailMobileNav(props: MemberDetailSectionNavProps) {
  return <MemberDetailSectionNav {...props} />
}

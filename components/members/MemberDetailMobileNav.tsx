"use client"

const SECTIONS = [
  { id: "member-workouts", label: "Workouts" },
  { id: "member-goals", label: "Goals" },
  { id: "member-checkins", label: "Check-ins" },
  { id: "member-habits", label: "Habits" },
  { id: "member-photos", label: "Photos" },
  { id: "member-notes", label: "Notes" },
  { id: "member-plans", label: "Plans" },
] as const

export default function MemberDetailMobileNav() {
  return (
    <nav
      aria-label="Jump to section"
      className="-mx-1 mb-6 overflow-x-auto overscroll-x-contain md:hidden"
    >
      <ul className="flex min-w-max gap-2 px-1 pb-1">
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:border-cyan-300 hover:text-cyan-700"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

"use client"

import { useEffect, useState } from "react"
import ProtectedShell from "../components/ProtectedShell"
import MemberCheckInSection from "@/components/members/MemberCheckInSection"
import EmptyState from "@/components/ui/empty-state"
import SectionLoadingState from "@/components/ui/section-loading-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import { fetchLinkedMember } from "@/lib/member-link"
import { createClient } from "@/lib/supabase/client"

type LinkedMember = {
  full_name: string
  coach_id: string | null
  current_weight: number | null
}

export default function MyCheckInsPage() {
  const supabase = createClient()
  const [member, setMember] = useState<LinkedMember | null>(null)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMember() {
      setLoading(true)

      const linked = await fetchLinkedMember(
        supabase,
        "full_name, coach_id, current_weight",
      )

      if (!linked) {
        setMemberId(null)
        setMember(null)
        setLoading(false)
        return
      }

      setMemberId(linked.id)
      setMember({
        full_name: String(linked.data.full_name ?? "Member"),
        coach_id:
          typeof linked.data.coach_id === "string" ? linked.data.coach_id : null,
        current_weight:
          typeof linked.data.current_weight === "number"
            ? linked.data.current_weight
            : null,
      })
      setLoading(false)
    }

    void loadMember()
  }, [supabase])

  return (
    <ProtectedShell allowed={["admin", "member"]}>
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="text-gradient">My Check-Ins</span>
          </h1>
          <p className="mt-3 text-slate-400">
            Log your weekly wellbeing, weight, and reflections for your coach.
          </p>
        </header>

        {loading ? (
          <SectionLoadingState label="Loading your profile" rows={4} />
        ) : !memberId || !member ? (
          <EmptyState {...SAAS_EMPTY.memberProfile} />
        ) : !member.coach_id ? (
          <EmptyState
            title="Coach not assigned"
            description="Your member profile is not linked to a coach yet. Ask your coach to finish setting up your account."
            variant="light"
          />
        ) : (
          <MemberCheckInSection
            variant="member"
            memberId={memberId}
            memberName={member.full_name}
            coachId={member.coach_id}
            fallbackWeight={member.current_weight}
          />
        )}
      </div>
    </ProtectedShell>
  )
}

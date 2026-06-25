import { supabase } from "@/lib/supabase"
import PageWrapper from "@/components/layout/page-wrapper"
import Card from "@/components/ui/card"

export default async function SessionsPage() {

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      *,
      members (
        full_name
      )
    `)

  return (
    <PageWrapper
      title="Sessions"
      description="Upcoming personal training and coaching sessions"
    >

      <div className="space-y-4">

        {sessions?.map((session) => (

          <Card key={session.id}>

            <div className="flex items-center justify-between">

              <div>
                <h3 className="text-lg font-semibold">
                  {session.session_type}
                </h3>

                <p className="text-zinc-400 mt-1">
                  {session.members?.full_name}
                </p>
              </div>

              <div className="text-right">

                <p className="font-medium">
                  {session.scheduled_date}
                </p>

                <p className="text-zinc-400 text-sm">
                  {session.scheduled_time}
                </p>

              </div>

            </div>

          </Card>

        ))}

      </div>

    </PageWrapper>
  )
}

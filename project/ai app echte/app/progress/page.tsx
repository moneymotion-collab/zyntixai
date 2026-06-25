import { supabase } from "@/lib/supabase"
import PageWrapper from "@/components/layout/page-wrapper"
import Card from "@/components/ui/card"

export default async function ProgressPage() {

  const { data: logs } = await supabase
    .from("progress_logs")
    .select(`
      *,
      members (
        full_name
      )
    `)

  return (
    <PageWrapper
      title="Progress Tracking"
      description="Track body composition and strength metrics"
    >

      <div className="space-y-4">

        {logs?.map((log) => (

          <Card key={log.id}>

            <div className="flex justify-between">

              <div>

                <h3 className="font-semibold">
                  {log.members?.full_name}
                </h3>

                <p className="text-zinc-400">
                  {log.metric}
                </p>

              </div>

              <div className="text-right">

                <p>
                  {log.current_value}
                </p>

                <p className="text-lime-400">
                  {log.change_value > 0 ? "+" : ""}
                  {log.change_value}
                </p>

              </div>

            </div>

          </Card>

        ))}

      </div>

    </PageWrapper>
  )
}

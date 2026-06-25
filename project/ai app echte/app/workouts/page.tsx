import { supabase } from "@/lib/supabase"
import PageWrapper from "@/components/layout/page-wrapper"
import Card from "@/components/ui/card"

export default async function WorkoutsPage() {

  const { data: plans } = await supabase
    .from("workout_plans")
    .select("*")

  return (
    <PageWrapper
      title="Workout Plans"
      description="Build and manage training programs for your members"
    >

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {plans?.map((plan) => (

          <Card key={plan.id}>

            <div className="space-y-4">

              <div>
                <h2 className="text-xl font-bold">
                  {plan.title}
                </h2>

                <p className="text-zinc-400 mt-1">
                  Goal: {plan.goal}
                </p>
              </div>

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-zinc-500 text-sm">
                    Weeks
                  </p>

                  <p className="font-semibold">
                    {plan.weeks}
                  </p>
                </div>

                <div>
                  <p className="text-zinc-500 text-sm">
                    Members
                  </p>

                  <p className="font-semibold">
                    {plan.assigned_members}
                  </p>
                </div>

              </div>

            </div>

          </Card>

        ))}

      </div>

    </PageWrapper>
  )
}

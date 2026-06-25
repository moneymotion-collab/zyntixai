import { supabase } from "@/lib/supabase"
import PageWrapper from "@/components/layout/page-wrapper"
import Card from "@/components/ui/card"

export default async function NutritionPage() {

  const { data: plans } = await supabase
    .from("nutrition_plans")
    .select("*")

  return (
    <PageWrapper
      title="Nutrition"
      description="Macro tracked meal plans tailored to member goals"
    >

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {plans?.map((plan) => (

          <Card key={plan.id}>

            <h3 className="text-xl font-semibold">
              {plan.title}
            </h3>

            <div className="mt-4 space-y-2 text-zinc-400">

              <p>
                Calories: {plan.calories}
              </p>

              <p>
                Protein: {plan.protein}g
              </p>

              <p>
                Carbs: {plan.carbs}g
              </p>

            </div>

          </Card>

        ))}

      </div>

    </PageWrapper>
  )
}

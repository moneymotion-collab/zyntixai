import ExerciseLibrary from "@/components/exercises/ExerciseLibrary"
import { SAAS_PAGE_MAIN } from "@/lib/ui/saas-page-layout"

export default function ExercisesPage() {
  return (
    <main className={SAAS_PAGE_MAIN}>
      <ExerciseLibrary />
    </main>
  )
}

import ProtectedShell from "@/app/components/ProtectedShell"
import ExerciseLibrary from "@/components/exercises/ExerciseLibrary"

export default function ExerciseLibraryPage() {
  return (
    <ProtectedShell>
      <ExerciseLibrary />
    </ProtectedShell>
  )
}

import ProtectedShell from "../components/ProtectedShell"
import { appointments } from "../../lib/fake-data"

export default function AppointmentsPage() {
  return (
    <ProtectedShell>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Appointments</h1>
          <p className="mt-2 text-gray-400">
            View upcoming calls, training sessions, and coaching reviews.
          </p>
        </div>

        <div className="space-y-4">
          {appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div>
                <h2 className="text-xl font-bold">{appointment.client}</h2>
                <p className="mt-1 text-gray-400">{appointment.type}</p>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  {appointment.date} - {appointment.time}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    appointment.status === "Confirmed"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                >
                  {appointment.status}
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </ProtectedShell>
  )
}

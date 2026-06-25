export type ClientCheckIn = {
  id: string
  coach_id: string
  member_id: string | null

  check_in_date: string
  weight: number | null
  energy: number | null
  sleep_quality: number | null
  stress: number | null
  hunger: number | null
  mood: string | null
  wins: string | null
  struggles: string | null
  notes: string | null

  created_at: string
}

export type ClientCheckInTrendSummary = {
  latestWeight: number | null
  averageEnergy: number | null
  averageSleep: number | null
  averageStress: number | null
}

export type CreateClientCheckInInput = {
  memberId: string
  memberName: string
  weight: number | null
  energy: number | null
  sleepQuality: number | null
  stress: number | null
  hunger: number | null
  mood: string | null
  wins: string | null
  struggles: string | null
  notes: string | null
  checkInDate?: string
}

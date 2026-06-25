export function buildProgressMemberUrl(memberId: string): string {
  return `/progress?member=${encodeURIComponent(memberId)}`
}

export function buildProgressReportUrl(memberId: string): string {
  return `/progress?member=${encodeURIComponent(memberId)}&section=report`
}

export function buildScheduleSessionUrl(memberId: string): string {
  return `/sessions?member=${encodeURIComponent(memberId)}&new=1`
}

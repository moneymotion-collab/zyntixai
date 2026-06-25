export type ProgressPhotoType =
  | "front"
  | "side"
  | "back"
  | "full_body"
  | "other"

export type ClientProgressPhoto = {
  id: string
  coach_id: string
  member_id: string
  photo_url: string
  photo_type: ProgressPhotoType
  taken_at: string
  notes: string | null
  created_at: string
}

export type CreateClientProgressPhotoInput = {
  memberId: string
  photoUrl: string
  photoType: ProgressPhotoType
  takenAt: string
  notes?: string | null
}

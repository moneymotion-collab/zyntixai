"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import {
  Camera,
  Check,
  ImagePlus,
  Loader2,
  Upload,
  X,
} from "lucide-react"
import Card, { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@/components/ui/empty-state"
import { SAAS_EMPTY } from "@/lib/copy/saas-empty-states"
import {
  comparePhotosByTakenAt,
  fetchMemberProgressPhotos,
  formatProgressPhotoDate,
  insertMemberProgressPhoto,
  PROGRESS_PHOTO_TYPE_OPTIONS,
  progressPhotoTypeLabel,
} from "@/lib/members/member-progress-photos"
import { uploadProgressPhoto } from "@/lib/progress-photos"
import type {
  ClientProgressPhoto,
  ProgressPhotoType,
} from "@/lib/types/client-progress-photos"
import {
  premiumInputClass,
  premiumTextareaClass,
} from "@/lib/ui/premium-input"
import { createClient } from "@/lib/supabase/client"

type MemberProgressPhotosSectionProps = {
  memberId: string
  onPhotoUploaded?: () => void
}

const labelClassName = "mb-2 block text-sm font-medium text-gray-700"

const PHOTO_TYPE_BADGE_CLASS: Record<ProgressPhotoType, string> = {
  front: "border-cyan-200 bg-cyan-50 text-cyan-800",
  side: "border-violet-200 bg-violet-50 text-violet-800",
  back: "border-amber-200 bg-amber-50 text-amber-800",
  full_body: "border-emerald-200 bg-emerald-50 text-emerald-800",
  other: "border-gray-200 bg-gray-50 text-gray-700",
}

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function PhotoTypeBadge({ type }: { type: ProgressPhotoType }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PHOTO_TYPE_BADGE_CLASS[type]}`}
    >
      {progressPhotoTypeLabel(type)}
    </span>
  )
}

function ComparePanel({ photos }: { photos: ClientProgressPhoto[] }) {
  const pair = comparePhotosByTakenAt(photos)
  if (!pair) return null

  const [beforePhoto, afterPhoto] = pair

  return (
    <div className="rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50/60 to-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            Before & After
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Oldest photo labeled Before, newest labeled After.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Before", photo: beforePhoto },
          { label: "After", photo: afterPhoto },
        ].map(({ label, photo }) => (
          <div key={photo.id} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                  label === "Before"
                    ? "bg-gray-900 text-white"
                    : "bg-cyan-600 text-white"
                }`}
              >
                {label}
              </span>
              <PhotoTypeBadge type={photo.photo_type} />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border bg-gray-100">
              <Image
                src={photo.photo_url}
                alt={`${label} progress photo`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-black">
                {formatProgressPhotoDate(photo.taken_at)}
              </p>
              {photo.notes ? (
                <p className="text-sm text-gray-600">{photo.notes}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PhotoGridCard({
  photo,
  selected,
  onToggleSelect,
}: {
  photo: ClientProgressPhoto
  selected: boolean
  onToggleSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggleSelect}
      className={`group relative overflow-hidden rounded-2xl border text-left transition ${
        selected
          ? "border-cyan-500 ring-2 ring-cyan-500/30"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="relative aspect-[3/4] bg-gray-100">
        <Image
          src={photo.photo_url}
          alt={`Progress photo from ${formatProgressPhotoDate(photo.taken_at)}`}
          fill
          className="object-cover transition group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          unoptimized
        />
        <div className="absolute left-3 top-3">
          <PhotoTypeBadge type={photo.photo_type} />
        </div>
        {selected ? (
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-white shadow-sm">
            <Check className="h-4 w-4" aria-hidden />
          </div>
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <p className="text-sm font-semibold text-black">
          {formatProgressPhotoDate(photo.taken_at)}
        </p>
        {photo.notes ? (
          <p className="line-clamp-2 text-xs text-gray-600">{photo.notes}</p>
        ) : (
          <p className="text-xs text-gray-400">{SAAS_EMPTY.memberPhotoCaption.title}</p>
        )}
      </div>
    </button>
  )
}

export default function MemberProgressPhotosSection({
  memberId,
  onPhotoUploaded,
}: MemberProgressPhotosSectionProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<ClientProgressPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoType, setPhotoType] = useState<ProgressPhotoType>("front")
  const [takenAt, setTakenAt] = useState(todayIsoDate())
  const [notes, setNotes] = useState("")

  const loadPhotos = useCallback(async () => {
    setLoading(true)

    const result = await fetchMemberProgressPhotos(supabase, memberId)

    if (result.error) {
      setFormError(result.error)
      setPhotos([])
    } else {
      setFormError(null)
      setPhotos(result.photos)
    }

    setLoading(false)
  }, [memberId, supabase])

  useEffect(() => {
    void loadPhotos()
  }, [loadPhotos])

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  const selectedPhotos = useMemo(
    () =>
      selectedIds
        .map((id) => photos.find((photo) => photo.id === id))
        .filter((photo): photo is ClientProgressPhoto => photo != null),
    [photos, selectedIds],
  )

  const resetUploadForm = () => {
    setSelectedFile(null)
    setPhotoType("front")
    setTakenAt(todayIsoDate())
    setNotes("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const togglePhotoSelection = (photoId: string) => {
    setSelectedIds((current) => {
      if (current.includes(photoId)) {
        return current.filter((id) => id !== photoId)
      }
      if (current.length >= 2) {
        return [current[1], photoId]
      }
      return [...current, photoId]
    })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
    setFormError(null)
  }

  const handleUpload = async () => {
    setFormError(null)

    if (!selectedFile) {
      setFormError("Select an image to upload.")
      return
    }

    if (!takenAt) {
      setFormError("Select the date the photo was taken.")
      return
    }

    setUploading(true)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      setFormError(authError?.message ?? "You must be signed in to upload photos.")
      setUploading(false)
      return
    }

    const uploadResult = await uploadProgressPhoto(
      supabase,
      user.id,
      memberId,
      selectedFile,
    )

    if (uploadResult.error || !uploadResult.photoUrl) {
      setFormError(uploadResult.error ?? "Upload failed.")
      setUploading(false)
      return
    }

    const insertResult = await insertMemberProgressPhoto(supabase, user.id, {
      memberId,
      photoUrl: uploadResult.photoUrl,
      photoType,
      takenAt,
      notes: notes || null,
    })

    if (insertResult.error) {
      setFormError(insertResult.error)
      setUploading(false)
      return
    }

    if (insertResult.photo) {
      setPhotos((current) => [insertResult.photo!, ...current])
    } else {
      await loadPhotos()
    }

    resetUploadForm()
    setUploading(false)
    onPhotoUploaded?.()
  }

  return (
    <Card variant="light">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            C4 Before & After Center
          </p>
          <CardTitle className="mt-1">Progress Photos</CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            Upload transformation photos, track angles over time, and compare
            before and after side by side.
          </p>
        </div>
        <Camera className="hidden h-8 w-8 text-cyan-600 sm:block" aria-hidden />
      </CardHeader>

      <CardContent className="space-y-6">
        {formError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        ) : null}

        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-gray-700" aria-hidden />
            <h3 className="text-lg font-semibold text-black">Upload photo</h3>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,220px)_1fr]">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="sr-only"
                id={`progress-photo-upload-${memberId}`}
              />
              <label
                htmlFor={`progress-photo-upload-${memberId}`}
                className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-center transition hover:border-gray-300 hover:bg-gray-50"
              >
                {previewUrl ? (
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    <Image
                      src={previewUrl}
                      alt="Selected progress photo preview"
                      fill
                      className="object-cover"
                      sizes="220px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                      <Upload className="h-5 w-5 text-gray-600" aria-hidden />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-black">
                        Select image
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        JPEG, PNG, WebP, or GIF up to 10 MB
                      </p>
                    </div>
                  </>
                )}
              </label>
              {selectedFile ? (
                <button
                  type="button"
                  onClick={resetUploadForm}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-white"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                  Clear selection
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor={`photo-type-${memberId}`}>
                  Photo type
                </label>
                <select
                  id={`photo-type-${memberId}`}
                  value={photoType}
                  onChange={(event) =>
                    setPhotoType(event.target.value as ProgressPhotoType)
                  }
                  className={premiumInputClass}
                >
                  {PROGRESS_PHOTO_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClassName} htmlFor={`taken-at-${memberId}`}>
                  Taken on
                </label>
                <input
                  id={`taken-at-${memberId}`}
                  type="date"
                  value={takenAt}
                  onChange={(event) => setTakenAt(event.target.value)}
                  className={premiumInputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClassName} htmlFor={`photo-notes-${memberId}`}>
                  Notes
                </label>
                <textarea
                  id={`photo-notes-${memberId}`}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  placeholder="Lighting, pose, weight context, or coaching notes…"
                  className={premiumTextareaClass}
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={() => void handleUpload()}
                  disabled={uploading || !selectedFile}
                  className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Upload className="h-4 w-4" aria-hidden />
                  )}
                  {uploading ? "Uploading…" : "Upload progress photo"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedPhotos.length === 2 ? (
          <ComparePanel photos={selectedPhotos} />
        ) : (
          <p className="text-sm text-gray-500">
            Select two photos from the grid below to compare before and after.
            {selectedIds.length === 1 ? " (1 selected)" : null}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading photos…
          </div>
        ) : photos.length === 0 ? (
          <EmptyState {...SAAS_EMPTY.memberProgressPhotos} variant="light" compact />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photos.map((photo) => (
              <PhotoGridCard
                key={photo.id}
                photo={photo}
                selected={selectedIds.includes(photo.id)}
                onToggleSelect={() => togglePhotoSelection(photo.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

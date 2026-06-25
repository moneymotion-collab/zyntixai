"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import {
  DEFAULT_BRAND_PROFILE_FORM,
  type BrandProfileFormValues,
} from "@/lib/marketing/brand-profile"
import {
  premiumInputClass,
  premiumTextareaClass,
} from "@/lib/ui/premium-input"

const inputClassName = premiumInputClass

type BrandProfileResponse = BrandProfileFormValues & {
  id: string | null
}

const FIELDS: {
  key: keyof BrandProfileFormValues
  label: string
  placeholder: string
  multiline?: boolean
}[] = [
  { key: "name", label: "Name", placeholder: "Brand name" },
  {
    key: "description",
    label: "Description",
    placeholder: "What your brand stands for",
    multiline: true,
  },
  { key: "niche", label: "Niche", placeholder: "e.g. CrossFit, boutique studio" },
  {
    key: "target_audience",
    label: "Target audience",
    placeholder: "Who you create content for",
  },
  {
    key: "tone_of_voice",
    label: "Tone of voice",
    placeholder: "e.g. motivational, professional",
  },
  {
    key: "goals",
    label: "Goals",
    placeholder: "e.g. get more members, build awareness",
  },
  {
    key: "platform_focus",
    label: "Platform focus",
    placeholder: "e.g. Instagram, short-form video",
  },
]

const MASCOT_FIELDS: {
  key: keyof BrandProfileFormValues
  label: string
  placeholder: string
  multiline?: boolean
}[] = [
  {
    key: "mascot_name",
    label: "Mascot name",
    placeholder: "e.g. FitCore AI",
  },
  {
    key: "mascot_description",
    label: "Mascot description",
    placeholder: "Who your mascot is and how they appear",
    multiline: true,
  },
  {
    key: "mascot_style",
    label: "Mascot style",
    placeholder: "e.g. Clean modern look. Colors: Black, White, Electric Blue",
    multiline: true,
  },
  {
    key: "mascot_voice_tone",
    label: "Mascot voice tone",
    placeholder: "e.g. Confident, Motivational, Professional",
  },
]

export default function BrandProfile() {
  const [brandId, setBrandId] = useState<string | null>(null)
  const [form, setForm] = useState<BrandProfileFormValues>(
    DEFAULT_BRAND_PROFILE_FORM,
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/marketing/brand", {
        credentials: "include",
      })
      const data = (await res.json()) as {
        error?: string
        profile?: BrandProfileResponse
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not load brand profile.")
        setLoading(false)
        return
      }

      const profile = data.profile ?? { ...DEFAULT_BRAND_PROFILE_FORM, id: null }
      setBrandId(profile.id)
      setForm({
        name: profile.name,
        description: profile.description,
        tone_of_voice: profile.tone_of_voice,
        target_audience: profile.target_audience,
        niche: profile.niche,
        goals: profile.goals,
        platform_focus: profile.platform_focus,
        mascot_name: profile.mascot_name,
        mascot_description: profile.mascot_description,
        mascot_style: profile.mascot_style,
        mascot_voice_tone: profile.mascot_voice_tone,
      })
    } catch {
      setErrorMessage("Could not load brand profile.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  function updateField(
    key: keyof BrandProfileFormValues,
    value: string,
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setErrorMessage(null)

    const isFirstSave = !brandId

    try {
      const res = await fetch("/api/marketing/brand", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })
      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not save brand profile.")
        setSaving(false)
        return
      }

      if (isFirstSave) {
        await loadProfile()

        const initRes = await fetch("/api/onboarding/initialize", {
          method: "POST",
          credentials: "include",
        })
        const initData = (await initRes.json()) as {
          error?: string
          posts_created?: number
        }

        if (!initRes.ok) {
          setErrorMessage(
            initData.error ??
              "Brand saved, but starter content could not be generated.",
          )
          setSaving(false)
          return
        }

        const count = initData.posts_created ?? 0
        setToast(
          successToast("brandSaved", {
            description:
              count > 0
                ? `${count} starter posts were generated for your brand.`
                : "Your starter content plan is ready.",
          }),
        )
      } else {
        setToast(successToast("brandSaved"))
      }
    } catch {
      setErrorMessage("Could not save brand profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black">Brand</h1>
        <p className="mt-2 text-gray-500">
          Define your brand so marketing AI matches your voice, audience, and
          goals.
        </p>
        {brandId ? (
          <p className="mt-1 font-mono text-xs text-gray-400">ID: {brandId}</p>
        ) : null}
      </div>

      <div className="max-w-2xl rounded-3xl border bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading brand…
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void handleSave()
            }}
          >
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.key}
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
                {field.multiline ? (
                  <textarea
                    id={field.key}
                    rows={3}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(event) =>
                      updateField(field.key, event.target.value)
                    }
                    className={premiumTextareaClass}
                  />
                ) : (
                  <input
                    id={field.key}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(event) =>
                      updateField(field.key, event.target.value)
                    }
                    className={inputClassName}
                  />
                )}
              </div>
            ))}

            <div className="border-t border-gray-100 pt-5">
              <h2 className="mb-1 text-lg font-semibold text-gray-900">
                Mascot
              </h2>
              <p className="mb-4 text-sm text-gray-500">
                Define your brand mascot for video scripts and character-driven
                content.
              </p>
              <div className="space-y-4">
                {MASCOT_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={field.key}
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      {field.label}
                    </label>
                    {field.multiline ? (
                      <textarea
                        id={field.key}
                        rows={3}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={(event) =>
                          updateField(field.key, event.target.value)
                        }
                        className={premiumTextareaClass}
                      />
                    ) : (
                      <input
                        id={field.key}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={(event) =>
                          updateField(field.key, event.target.value)
                        }
                        className={inputClassName}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {brandId ? "Saving…" : "Saving & generating…"}
                  </>
                ) : (
                  "Save Brand"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {errorMessage ? (
        <p className="mt-4 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {toast ? (
        <Toast
          title={toast.title}
          description={toast.description}
          variant={toast.variant ?? "success"}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </div>
  )
}

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import Toast, { type ToastPayload } from "@/app/components/Toast"
import InstagramConnectionStatusCard from "@/components/marketing/InstagramConnectionStatusCard"
import {
  DEFAULT_MARKETING_SETTINGS_FORM,
  MARKETING_BUSINESS_GOALS,
  MARKETING_CONTENT_TONES,
  MARKETING_GYM_TYPES,
  MARKETING_SELECTABLE_PLATFORMS,
  MARKETING_POSTING_FREQUENCIES,
  MARKETING_TARGET_AUDIENCES,
  loadOrCreateMarketingSettings,
  marketingSettingsToFormValues,
  saveMarketingSettings,
  type MarketingSettingsFormValues,
} from "@/lib/marketing/marketing-settings"
import {
  isTikTokPublishingAvailable,
} from "@/lib/marketing/platform-availability"
import { isTikTokPlatform } from "@/lib/marketing/platform-utils"
import { createClient } from "@/lib/supabase/client"
import Select from "@/components/ui/select"
import {
  fitcoreBtnPrimaryClass,
  fitcoreCardClass,
  fitcoreLabelClass,
  fitcoreMutedClass,
  fitcoreSurfaceClass,
} from "@/lib/ui/fitcore-form"

function SettingsField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: keyof MarketingSettingsFormValues
  label: string
  value: string
  options: readonly string[]
  onChange: (field: keyof MarketingSettingsFormValues, value: string) => void
}) {
  return (
    <div>
      <label htmlFor={id} className={fitcoreLabelClass}>
        {label}
      </label>
      <Select
        id={id}
        value={value ?? ""}
        onChange={(event) => onChange(id, event.target.value)}
      >
        <option value="">Select…</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  )
}

type MarketingBrandSettingsProps = {
  title?: string
  description?: string
  saveSuccessMessage?: string
}

export default function MarketingBrandSettings({
  title = "Brand",
  description = "Tell ZyntixAI about your gym so content ideas match your brand and goals.",
  saveSuccessMessage = "Brand settings saved.",
}: MarketingBrandSettingsProps) {
  const supabase = useMemo(() => createClient(), [])

  const [formValues, setFormValues] = useState<MarketingSettingsFormValues>(
    DEFAULT_MARKETING_SETTINGS_FORM,
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)

    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData.user) {
      setErrorMessage(authError?.message ?? "Could not load your account.")
      setLoading(false)
      return
    }

    const { settings, error } = await loadOrCreateMarketingSettings(
      supabase,
      userData.user.id,
    )

    if (error || !settings) {
      setErrorMessage(error ?? "Could not load brand settings.")
      setLoading(false)
      return
    }

    setFormValues(marketingSettingsToFormValues(settings))
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  function updateField(
    field: keyof MarketingSettingsFormValues,
    value: string,
  ) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setErrorMessage(null)

    const { data: userData, error: authError } = await supabase.auth.getUser()

    if (authError || !userData.user) {
      setErrorMessage(authError?.message ?? "Could not verify your account.")
      setSaving(false)
      return
    }

    const { error } = await saveMarketingSettings(
      supabase,
      userData.user.id,
      formValues,
    )

    if (error) {
      setErrorMessage(error)
      setSaving(false)
      return
    }

    setToast({ title: saveSuccessMessage, variant: "success" })
    setSaving(false)
  }

  return (
    <div className={`p-6 ${fitcoreSurfaceClass}`}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
        <p className={`mt-2 ${fitcoreMutedClass}`}>{description}</p>
      </div>

      <div className={`${fitcoreCardClass} max-w-2xl p-6`}>
        {loading ? (
          <div className={`flex items-center justify-center py-12 ${fitcoreMutedClass}`}>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading settings…
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              void handleSave()
            }}
          >
            <SettingsField
              id="gym_type"
              label="Gym Type"
              value={formValues.gym_type}
              options={MARKETING_GYM_TYPES}
              onChange={updateField}
            />

            <SettingsField
              id="target_audience"
              label="Target Audience"
              value={formValues.target_audience}
              options={MARKETING_TARGET_AUDIENCES}
              onChange={updateField}
            />

            <SettingsField
              id="business_goal"
              label="Business Goal"
              value={formValues.business_goal}
              options={MARKETING_BUSINESS_GOALS}
              onChange={updateField}
            />

            <SettingsField
              id="posting_frequency"
              label="Posting Frequency"
              value={formValues.posting_frequency}
              options={MARKETING_POSTING_FREQUENCIES}
              onChange={updateField}
            />

            <SettingsField
              id="content_tone"
              label="Content Tone"
              value={formValues.content_tone}
              options={MARKETING_CONTENT_TONES}
              onChange={updateField}
            />

            <SettingsField
              id="preferred_platform"
              label="Preferred Platform"
              value={formValues.preferred_platform}
              options={MARKETING_SELECTABLE_PLATFORMS}
              onChange={updateField}
            />

            {isTikTokPlatform(formValues.preferred_platform) &&
            !isTikTokPublishingAvailable() ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Your saved preference is short-form video. For beta, choose
                Instagram Reels for live publishing.
              </p>
            ) : null}

            <div className="flex justify-end border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={saving}
                className={fitcoreBtnPrimaryClass}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <InstagramConnectionStatusCard />

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

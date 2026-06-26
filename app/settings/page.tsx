"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { FITCORE_AI_BRAND_NAME } from "@/lib/brand/fitcore-ai"
import ProtectedShell from "../components/ProtectedShell"
import SignOutButton from "../components/SignOutButton"
import Toast, { type ToastPayload } from "../components/Toast"
import { successToast } from "@/lib/copy/success-toasts"
import { useRole } from "../hooks/useRole"
import { useSubscriptionAccess } from "../hooks/useSubscriptionAccess"
import { hasRole } from "@/lib/auth/roles"
import {
  formatTrialEndsAt,
  getTrialDaysRemaining,
  getTrialStatusMessage,
  isProfileTrialActive,
} from "@/lib/coach-trial"
import { isTikTokPublishingAvailable } from "@/lib/marketing/platform-availability"
import SubscriptionStatusBadge from "../components/SubscriptionStatusBadge"
import { useBillingPortal } from "../hooks/useBillingPortal"
import { useSubscribe } from "../hooks/useSubscribe"
import { shouldShowManageBilling, type ManageBillingProfile } from "@/lib/billing/manage-billing"
import { BILLING_PLAN_DETAILS, getBillingPlanLabel, parseBillingPlan } from "@/lib/stripe-config"
import {
  getDisplaySubscriptionStatus,
  needsSubscriptionUpgrade,
  type SubscriptionProfile,
} from "@/lib/subscription-access"
import { SUBSCRIPTION_STATUS } from "@/lib/subscription-status"
import {
  DEFAULT_GYM_SETTINGS_FORM,
  type GymSettingsFormValues,
} from "@/lib/gym-settings"
import SettingsNav from "@/components/settings/SettingsNav"
import Input from "@/components/ui/input"
import {
  fitcoreCardClass,
  fitcoreLabelClass,
  fitcoreSurfaceClass,
  premiumInputClass,
} from "@/lib/ui/fitcore-form"

const inputClassName = premiumInputClass

type InstagramConnectionFormValues = {
  instagramBusinessAccountId: string
  accessToken: string
  accountUsername: string
  pageId: string
  tokenValid?: boolean
  accessTokenMasked?: string
}

function getInstagramConnectionStatus(values: InstagramConnectionFormValues) {
  if (!values.instagramBusinessAccountId.trim()) {
    return "Missing Instagram account ID"
  }
  if (!values.accessToken.trim()) {
    return values.tokenValid === false ? "Invalid token — reconnect" : "Missing token"
  }
  return "Connected"
}

const DEFAULT_INSTAGRAM_CONNECTION_FORM: InstagramConnectionFormValues = {
  instagramBusinessAccountId: "",
  accessToken: "",
  accountUsername: "",
  pageId: "",
  tokenValid: undefined,
  accessTokenMasked: "",
}

function GymSettingsForm({
  values,
  onChange,
  onSubmit,
  saving,
}: {
  values: GymSettingsFormValues
  onChange: (field: keyof GymSettingsFormValues, value: string) => void
  onSubmit: () => void
  saving: boolean
}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div>
        <label htmlFor="gym_name" className={fitcoreLabelClass}>
          Gym Name
        </label>
        <input
          id="gym_name"
          type="text"
          value={values.gym_name}
          onChange={(event) => onChange("gym_name", event.target.value)}
          className={inputClassName}
          placeholder="Your gym name"
        />
      </div>

      <div>
        <label htmlFor="logo_url" className={fitcoreLabelClass}>
          Logo URL
        </label>
        <input
          id="logo_url"
          type="url"
          value={values.logo_url}
          onChange={(event) => onChange("logo_url", event.target.value)}
          className={inputClassName}
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div>
        <label htmlFor="website" className={fitcoreLabelClass}>
          Website
        </label>
        <input
          id="website"
          type="url"
          value={values.website}
          onChange={(event) => onChange("website", event.target.value)}
          className={inputClassName}
          placeholder="https://yourgym.com"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label
            htmlFor="instagram_url"
            className={fitcoreLabelClass}
          >
            Instagram URL
          </label>
          <input
            id="instagram_url"
            type="url"
            value={values.instagram_url}
            onChange={(event) => onChange("instagram_url", event.target.value)}
            className={inputClassName}
            placeholder="https://instagram.com/yourgym"
          />
        </div>

        <div>
          <label
            htmlFor="facebook_url"
            className={fitcoreLabelClass}
          >
            Facebook URL
          </label>
          <input
            id="facebook_url"
            type="url"
            value={values.facebook_url}
            onChange={(event) => onChange("facebook_url", event.target.value)}
            className={inputClassName}
            placeholder="https://facebook.com/yourgym"
          />
        </div>

        {isTikTokPublishingAvailable() ? (
          <div>
            <label
              htmlFor="tiktok_url"
              className={fitcoreLabelClass}
            >
              TikTok URL
            </label>
            <input
              id="tiktok_url"
              type="url"
              value={values.tiktok_url}
              onChange={(event) => onChange("tiktok_url", event.target.value)}
              className={inputClassName}
              placeholder="https://tiktok.com/@yourgym"
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="primary_color"
            className={fitcoreLabelClass}
          >
            Primary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              id="primary_color"
              type="color"
              value={values.primary_color}
              onChange={(event) => onChange("primary_color", event.target.value)}
              className="h-11 w-14 cursor-pointer rounded-xl border border-gray-300 bg-white p-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
            <input
              type="text"
              value={values.primary_color}
              onChange={(event) => onChange("primary_color", event.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="secondary_color"
            className={fitcoreLabelClass}
          >
            Secondary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              id="secondary_color"
              type="color"
              value={values.secondary_color}
              onChange={(event) =>
                onChange("secondary_color", event.target.value)
              }
              className="h-11 w-14 cursor-pointer rounded-xl border border-gray-300 bg-white p-1 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
            <input
              type="text"
              value={values.secondary_color}
              onChange={(event) =>
                onChange("secondary_color", event.target.value)
              }
              className={inputClassName}
            />
          </div>
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
              Saving…
            </>
          ) : (
            "Save Settings"
          )}
        </button>
      </div>
    </form>
  )
}

function InstagramConnectionForm({
  values,
  onChange,
  onSubmit,
  saving,
  statusLabel,
}: {
  values: InstagramConnectionFormValues
  onChange: (field: keyof InstagramConnectionFormValues, value: string) => void
  onSubmit: () => void
  saving: boolean
  statusLabel: string
}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
        <span className="text-gray-600">Status</span>
        <span className="font-medium text-gray-900">{statusLabel}</span>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Use a Meta Page access token from Graph API Explorer. It should start
        with <code>EAA</code> and be about 200 characters long.
      </div>

      {statusLabel === "Invalid token — reconnect" ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          The saved token is not valid. Paste a new Page access token below and
          click Save Connection.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="instagram_business_account_id"
            className={fitcoreLabelClass}
          >
            Instagram Business Account ID
          </label>
          <input
            id="instagram_business_account_id"
            type="text"
            value={values.instagramBusinessAccountId}
            onChange={(event) =>
              onChange("instagramBusinessAccountId", event.target.value)
            }
            className={inputClassName}
            placeholder="1784…"
          />
        </div>

        <div>
          <label
            htmlFor="instagram_account_username"
            className={fitcoreLabelClass}
          >
            Account username
          </label>
          <input
            id="instagram_account_username"
            type="text"
            value={values.accountUsername}
            onChange={(event) => onChange("accountUsername", event.target.value)}
            className={inputClassName}
            placeholder="@youraccount"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="instagram_page_id"
            className={fitcoreLabelClass}
          >
            Page ID
          </label>
          <input
            id="instagram_page_id"
            type="text"
            value={values.pageId}
            onChange={(event) => onChange("pageId", event.target.value)}
            className={inputClassName}
            placeholder="1234567890"
          />
        </div>

        <div>
          <label
            htmlFor="instagram_access_token"
            className={fitcoreLabelClass}
          >
            Access token
          </label>
          <input
            id="instagram_access_token"
            type="password"
            value={values.accessToken}
            onChange={(event) => onChange("accessToken", event.target.value)}
            className={inputClassName}
            placeholder="EAAG…"
            autoComplete="off"
          />
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
              Saving…
            </>
          ) : (
            "Save Connection"
          )}
        </button>
      </div>
    </form>
  )
}

function SubscriptionSection({
  profile,
  loading,
}: {
  profile: ManageBillingProfile | null
  loading: boolean
}) {
  const { subscribe, loading: upgrading, errorMessage: upgradeError } =
    useSubscribe()
  const {
    openPortal,
    loading: portalLoading,
    errorMessage: portalError,
  } = useBillingPortal()

  if (loading) {
    return (
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading subscription…
      </div>
    )
  }

  if (!profile) return null

  const displayStatus = getDisplaySubscriptionStatus(profile)
  const trialEndsLabel = formatTrialEndsAt(profile.trial_ends_at)
  const daysRemaining = getTrialDaysRemaining(profile.trial_ends_at)
  const trialActive = isProfileTrialActive(profile)
  const trialEndedMessage = getTrialStatusMessage(profile.trial_ends_at)
  const showUpgrade = needsSubscriptionUpgrade(profile)
  const showManageBilling = shouldShowManageBilling(profile)
  const currentPlanLabel = getBillingPlanLabel(profile.billing_plan)
  const upgradePlan = parseBillingPlan(profile.billing_plan) ?? "basic"

  return (
    <div className="mt-4 space-y-3 text-sm">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <span className="text-gray-600">Subscription status</span>
        {displayStatus ? (
          <SubscriptionStatusBadge status={displayStatus} />
        ) : (
          <span className="font-medium text-gray-900">Unknown</span>
        )}
      </div>

      {currentPlanLabel ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <span className="text-gray-600">Current plan</span>
          <span className="font-medium text-gray-900">{currentPlanLabel}</span>
        </div>
      ) : null}

      {trialEndsLabel ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <span className="text-gray-600">Trial ends</span>
          <span className="text-right font-medium text-gray-900">
            {trialEndsLabel}
          </span>
        </div>
      ) : null}

      {displayStatus === SUBSCRIPTION_STATUS.trial && trialActive && daysRemaining !== null ? (
        <p className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-cyan-800">
          {daysRemaining === 0
            ? "Your trial ends today."
            : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left in your trial.`}
        </p>
      ) : null}

      {trialEndedMessage ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 capitalize text-amber-800">
          {trialEndedMessage}. Upgrade to keep using {FITCORE_AI_BRAND_NAME}.
        </p>
      ) : null}

      {displayStatus === SUBSCRIPTION_STATUS.cancelled ? (
        <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700">
          Your subscription was cancelled. Resubscribe to restore full access.
        </p>
      ) : null}

      {displayStatus === SUBSCRIPTION_STATUS.past_due ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          Payment failed. Update your billing details to avoid losing access.
        </p>
      ) : null}

      {displayStatus === SUBSCRIPTION_STATUS.active ? (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          Your subscription is active. You have full access to {FITCORE_AI_BRAND_NAME}.
        </p>
      ) : null}

      {upgradeError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {upgradeError}
        </p>
      ) : null}

      {portalError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {portalError}
        </p>
      ) : null}

      {showManageBilling ? (
        <button
          type="button"
          disabled={portalLoading}
          onClick={() => void openPortal()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {portalLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening portal…
            </>
          ) : (
            "Manage billing"
          )}
        </button>
      ) : null}

      {showUpgrade ? (
        <button
          type="button"
          disabled={upgrading}
          onClick={() => void subscribe(upgradePlan)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {upgrading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting…
            </>
          ) : (
            `Upgrade €${BILLING_PLAN_DETAILS[upgradePlan].price}/month`
          )}
        </button>
      ) : null}
    </div>
  )
}

export default function SettingsPage() {
  const { role, loading: roleLoading } = useRole()
  const isGymOwner = hasRole(role, ["admin", "coach"])
  const isCoach = role === "coach"
  const {
    profile: subscriptionProfile,
    loading: subscriptionLoading,
  } = useSubscriptionAccess()

  const [formValues, setFormValues] = useState<GymSettingsFormValues>(
    DEFAULT_GYM_SETTINGS_FORM,
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [instagramFormValues, setInstagramFormValues] =
    useState<InstagramConnectionFormValues>(DEFAULT_INSTAGRAM_CONNECTION_FORM)
  const [instagramLoading, setInstagramLoading] = useState(true)
  const [instagramSaving, setInstagramSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastPayload | null>(null)

  const loadSettings = useCallback(async () => {
    if (!isGymOwner) {
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/gym-settings", { credentials: "include" })
      const data = (await res.json()) as {
        error?: string
        settings?: GymSettingsFormValues
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not load gym settings.")
        return
      }

      if (!data.settings) {
        setErrorMessage("Could not load gym settings.")
        return
      }

      setFormValues(data.settings)
    } catch {
      setErrorMessage("Could not load gym settings.")
    } finally {
      setLoading(false)
    }
  }, [isGymOwner])

  const loadInstagramConnection = useCallback(async () => {
    setInstagramLoading(true)

    try {
      const res = await fetch("/api/instagram/connection", {
        credentials: "include",
      })
      const data = (await res.json()) as {
        error?: string
        connection?: InstagramConnectionFormValues & {
          tokenValid?: boolean
          accessTokenMasked?: string
        } | null
      }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not load Instagram connection.")
        return
      }

      setInstagramFormValues(
        data.connection
          ? {
              instagramBusinessAccountId:
                data.connection.instagramBusinessAccountId ?? "",
              accessToken: data.connection.accessToken ?? "",
              accountUsername: data.connection.accountUsername ?? "",
              pageId: data.connection.pageId ?? "",
              tokenValid: data.connection.tokenValid,
              accessTokenMasked: data.connection.accessTokenMasked ?? "",
            }
          : DEFAULT_INSTAGRAM_CONNECTION_FORM,
      )
    } catch {
      setErrorMessage("Could not load Instagram connection.")
    } finally {
      setInstagramLoading(false)
    }
  }, [])

  useEffect(() => {
    if (roleLoading) return
    void loadSettings()
    void loadInstagramConnection()
  }, [loadSettings, roleLoading])

  function updateField(field: keyof GymSettingsFormValues, value: string) {
    setFormValues((current) => ({ ...current, [field]: value }))
  }

  function updateInstagramField(
    field: keyof InstagramConnectionFormValues,
    value: string,
  ) {
    setInstagramFormValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/gym-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formValues),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not save gym settings.")
        return
      }

      setToast(successToast("gymSettingsSaved"))
    } catch {
      setErrorMessage("Could not save gym settings.")
    } finally {
      setSaving(false)
    }
  }

  async function handleInstagramSave() {
    setInstagramSaving(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/instagram/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(instagramFormValues),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setErrorMessage(data.error ?? "Could not save Instagram connection.")
        return
      }

      setToast(successToast("instagramConnectionSaved"))
    } catch {
      setErrorMessage("Could not save Instagram connection.")
    } finally {
      setInstagramSaving(false)
    }
  }

  return (
    <ProtectedShell>
      <div className="p-6">
        <h1 className="text-4xl font-bold text-black">Settings</h1>
        <p className="mt-2 text-gray-500">
          Manage your gym profile, branding, and account preferences.
        </p>

        <SettingsNav />

        {isGymOwner ? (
          <section className="mt-8 max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Gym Settings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Branding and social links used across your marketing content.
            </p>

            {loading ? (
              <div className="mt-8 flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading settings…
              </div>
            ) : (
              <div className="mt-6">
                <GymSettingsForm
                  values={formValues}
                  onChange={updateField}
                  onSubmit={() => void handleSave()}
                  saving={saving}
                />
              </div>
            )}
          </section>
        ) : null}

        <section className="mt-8 max-w-3xl rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-black">Instagram connection</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manually store the credentials needed for publishing.
          </p>

          {instagramLoading ? (
            <div className="mt-8 flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading connection…
            </div>
          ) : (
            <div className="mt-6">
              <InstagramConnectionForm
                values={instagramFormValues}
                onChange={updateInstagramField}
                onSubmit={() => void handleInstagramSave()}
                saving={instagramSaving}
                statusLabel={getInstagramConnectionStatus(instagramFormValues)}
              />
            </div>
          )}
        </section>

        {isCoach ? (
          <section className="mt-8 max-w-lg rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-black">Subscription</h2>
            <p className="mt-1 text-sm text-gray-500">
              Your coach trial and billing status.
            </p>
            <SubscriptionSection
              profile={subscriptionProfile}
              loading={subscriptionLoading}
            />
          </section>
        ) : null}

        <section className="mt-8 max-w-lg rounded-3xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-black">Account</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sign out of your {FITCORE_AI_BRAND_NAME} account on this device.
          </p>
          <div className="mt-4">
            <SignOutButton />
          </div>
        </section>

        {errorMessage ? (
          <p className="mt-4 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
    </ProtectedShell>
  )
}

import { isTikTokPlatform as matchTikTokPlatform } from "@/lib/marketing/social-publish/match-platform"

export function normalizePlatform(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase()
}

export function isInstagramPlatform(value: string | null | undefined): boolean {
  const platform = normalizePlatform(value)
  return platform === "instagram" || platform.includes("instagram")
}

export function isTikTokPlatform(value: string | null | undefined): boolean {
  return matchTikTokPlatform(value ?? "")
}

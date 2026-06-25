export function normalizePlatformName(platform: string): string {
  return platform.trim().toLowerCase()
}

export function isInstagramPlatform(platform: string): boolean {
  const name = normalizePlatformName(platform)
  return name === "instagram" || name.includes("instagram")
}

export function isTikTokPlatform(platform: string): boolean {
  const name = normalizePlatformName(platform)
  return name === "tiktok" || name.includes("tiktok")
}

export function isLinkedInPlatform(platform: string): boolean {
  const name = normalizePlatformName(platform)
  return name === "linkedin" || name.includes("linkedin")
}

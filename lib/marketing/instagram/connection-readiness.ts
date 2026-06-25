import type { InstagramConnectionStatus } from "@/lib/marketing/instagram/token-health"

export function isInstagramConnectionReadyForPublish(
  status: InstagramConnectionStatus | undefined,
): boolean {
  return status === "connected" || status === "token_expiring_soon"
}

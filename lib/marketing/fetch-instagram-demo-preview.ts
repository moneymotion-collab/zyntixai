import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { InstagramDemoPreviewData } from "@/lib/marketing/instagram-demo-preview-types"
import { buildInstagramShowcaseData } from "@/lib/marketing/instagram-demo-showcase-data"
import { loadOrCreateBrandProfile } from "@/lib/marketing/brand-profile"

export {
  INSTAGRAM_SHOWCASE_USERNAME as INSTAGRAM_DEMO_USERNAME,
  INSTAGRAM_SHOWCASE_DISPLAY_NAME as INSTAGRAM_DEMO_DISPLAY_NAME,
  INSTAGRAM_SHOWCASE_BIO as INSTAGRAM_DEMO_BIO,
} from "@/lib/marketing/instagram-demo-showcase-data"

export async function fetchInstagramDemoPreview(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<InstagramDemoPreviewData> {
  const { profile: brand } = await loadOrCreateBrandProfile(supabase, userId)
  return buildInstagramShowcaseData(brand?.description ?? null)
}

export {
  HOOK_CATEGORY_META,
  getHookCategoryMeta,
  type HookCategoryMeta,
} from "@/lib/marketing/hook-library/categories"
export { generateHookLibrary } from "@/lib/marketing/hook-library/generate"
export { MOCK_HOOK_LIBRARY } from "@/lib/marketing/hook-library/mock-hooks"
export {
  HOOK_CATEGORIES,
  HOOKS_PER_CAMPAIGN,
  groupHooksByCategory,
  isHookCategory,
  normalizeHookCategory,
  normalizeHookLibraryItem,
  parseHookLibraryResponse,
  type GenerateHookLibraryInput,
  type HookCategory,
  type HookLibraryItem,
  type HookLibraryResult,
} from "@/lib/marketing/hook-library/types"

import type { PlatformAssistantModule } from "./types"

/**
 * Future-proof module registry — plug in Accounting, CRM, Sales, etc.
 * without rewriting the assistant core.
 */
const registeredModules: PlatformAssistantModule[] = []

export function registerPlatformModule(module: PlatformAssistantModule): void {
  const existing = registeredModules.findIndex((m) => m.id === module.id)
  if (existing >= 0) {
    registeredModules[existing] = module
  } else {
    registeredModules.push(module)
  }
}

export function getRegisteredModules(): readonly PlatformAssistantModule[] {
  return registeredModules
}

export function findModuleForPath(pathname: string): PlatformAssistantModule | null {
  for (const module of registeredModules) {
    if (module.routePrefixes.some((prefix) => pathname.startsWith(prefix))) {
      return module
    }
  }
  return null
}

/** Built-in ZyntixAI coaching module (always available) */
export const ZYNTIX_COACHING_MODULE: PlatformAssistantModule = {
  id: "coaching",
  name: "Coaching & Business OS",
  routePrefixes: [
    "/dashboard",
    "/members",
    "/workouts",
    "/nutrition",
    "/sessions",
    "/progress",
    "/marketing",
    "/ai-coach",
    "/coach-workspace",
    "/analytics",
  ],
}

registerPlatformModule(ZYNTIX_COACHING_MODULE)

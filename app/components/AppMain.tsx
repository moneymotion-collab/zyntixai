"use client"

import { AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import PlatformAssistantShell from "@/components/platform-assistant/PlatformAssistantShell"
import DemoModeIndicatorHost from "@/components/workspace/DemoModeIndicatorHost"
import DemoProductTourHost from "@/components/tour/DemoProductTourHost"
import PageTransition from "@/components/ui/page-transition"
import { isPageTransitionRoute } from "@/lib/navigation/page-transition-routes"
import { isPublicAppPath } from "@/lib/navigation/is-public-path"

export default function AppMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const shouldAnimate = isPageTransitionRoute(pathname)
  const showWorkspaceChrome = !isPublicAppPath(pathname)

  return (
    <main className="premium-shell premium-mesh min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
      <div
        className={
          showWorkspaceChrome ? "p-5 md:p-8 lg:p-10" : "min-w-0 p-0"
        }
      >
        {showWorkspaceChrome ? <DemoModeIndicatorHost /> : null}
        <PlatformAssistantShell showChrome={showWorkspaceChrome}>
          <AnimatePresence mode="wait" initial={false}>
            {shouldAnimate ? (
              <PageTransition key={pathname} routeKey={pathname}>
                {children}
              </PageTransition>
            ) : (
              <div key={pathname} className="min-w-0">
                {children}
              </div>
            )}
          </AnimatePresence>
        </PlatformAssistantShell>
      </div>
      {showWorkspaceChrome ? <DemoProductTourHost /> : null}
    </main>
  )
}

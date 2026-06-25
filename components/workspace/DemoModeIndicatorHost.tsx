"use client"

import { usePathname } from "next/navigation"
import DemoModeIndicator from "@/components/workspace/DemoModeIndicator"
import { useIsDemoWorkspace } from "@/app/hooks/useIsDemoWorkspace"
import { isPublicAppPath } from "@/lib/navigation/is-public-path"

export default function DemoModeIndicatorHost() {
  const pathname = usePathname()
  const { isDemoWorkspace, loading } = useIsDemoWorkspace()

  if (loading || !isDemoWorkspace || isPublicAppPath(pathname)) {
    return null
  }

  return <DemoModeIndicator />
}

"use client"

import PlatformCommandBar from "./PlatformCommandBar"

export default function PlatformAssistantShell({
  children,
  showChrome,
}: {
  children: React.ReactNode
  showChrome: boolean
}) {
  return (
    <>
      {children}
      {showChrome ? <PlatformCommandBar /> : null}
    </>
  )
}

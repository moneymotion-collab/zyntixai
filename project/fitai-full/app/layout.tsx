import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Fitness Login",
  description: "Login page for the AI Fitness Dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

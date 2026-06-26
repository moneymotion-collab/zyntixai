import type { Metadata } from "next"

import "./globals.css"

import Sidebar from "@/components/Sidebar"
import { PlatformAssistantProvider } from "@/components/platform-assistant/PlatformAssistantProvider"
import ZyntixAiTopNav from "@/components/platform-assistant/ZyntixAiTopNav"

import AppMain from "./components/AppMain"

import { AuthProvider } from "./providers/AuthProvider"

import {

  FITCORE_AI_BRAND_NAME,

  FITCORE_AI_METADATA_DESCRIPTION,

  FITCORE_AI_OG_DESCRIPTION,

  FITCORE_AI_OG_TITLE,

  FITCORE_AI_TAGLINE,

} from "@/lib/brand/fitcore-ai"

import {
  absoluteSiteUrl,
  getMetadataBase,
  SITE_OG_IMAGE,
} from "@/lib/seo/site-metadata"

const metadataBase = getMetadataBase()
const rootOgImageUrl =
  absoluteSiteUrl(SITE_OG_IMAGE.url) ?? SITE_OG_IMAGE.url

export const metadata: Metadata = {
  ...(metadataBase ? { metadataBase } : {}),

  title: {

    default: `${FITCORE_AI_BRAND_NAME} | ${FITCORE_AI_TAGLINE}`,

    template: `%s | ${FITCORE_AI_BRAND_NAME}`,

  },

  description: FITCORE_AI_METADATA_DESCRIPTION,

  openGraph: {

    title: FITCORE_AI_OG_TITLE,

    description: FITCORE_AI_OG_DESCRIPTION,

    siteName: FITCORE_AI_BRAND_NAME,

    type: "website",

    locale: "en_US",

    images: [
      absoluteSiteUrl(SITE_OG_IMAGE.url)
        ? { ...SITE_OG_IMAGE, url: rootOgImageUrl }
        : SITE_OG_IMAGE,
    ],

  },

  twitter: {

    card: "summary_large_image",

    title: FITCORE_AI_OG_TITLE,

    description: FITCORE_AI_OG_DESCRIPTION,

    images: [rootOgImageUrl],

  },

  icons: {
    icon: [
      { url: "/brand/zyntixai-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/zyntixai-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/brand/zyntixai-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },

}



export default function RootLayout({

  children,

}: {

  children: React.ReactNode

}) {

  return (

    <html lang="en">

      <body className="bg-[#06080f] text-slate-100 antialiased">

        <AuthProvider>
          <PlatformAssistantProvider>
            <div className="flex min-h-screen flex-col md:flex-row">
              <Sidebar />

              <div className="flex min-w-0 flex-1 flex-col">
                <ZyntixAiTopNav />
                <AppMain>{children}</AppMain>
              </div>
            </div>
          </PlatformAssistantProvider>
        </AuthProvider>

      </body>

    </html>

  )

}



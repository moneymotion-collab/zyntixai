import type { Metadata } from "next"

import "./globals.css"

import Sidebar from "@/components/Sidebar"

import AppMain from "./components/AppMain"

import { AuthProvider } from "./providers/AuthProvider"

import {

  FITCORE_AI_BRAND_NAME,

  FITCORE_AI_METADATA_DESCRIPTION,

  FITCORE_AI_OG_DESCRIPTION,

  FITCORE_AI_OG_TITLE,

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

    default: FITCORE_AI_BRAND_NAME,

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

          <div className="flex min-h-screen flex-col md:flex-row">

            <Sidebar />



            <AppMain>{children}</AppMain>

          </div>

        </AuthProvider>

      </body>

    </html>

  )

}



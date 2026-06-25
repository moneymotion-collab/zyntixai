import type { Metadata } from "next"

import { redirect } from "next/navigation"

import LandingPage from "@/app/components/LandingPage"

import LandingJsonLd from "@/components/seo/LandingJsonLd"

import { resolvePostLoginRoute } from "@/lib/auth/post-login"

import { createClient } from "@/lib/supabase/server"

import { buildPageMetadata, HOME_SEO } from "@/lib/seo/site-metadata"



export const metadata: Metadata = buildPageMetadata({

  title: HOME_SEO.title,

  description: HOME_SEO.description,

  path: "/",

  openGraphTitle: HOME_SEO.openGraphTitle,

  openGraphDescription: HOME_SEO.openGraphDescription,

})



export default async function Home() {

  const supabase = await createClient()

  const {

    data: { user },

  } = await supabase.auth.getUser()



  if (user) {

    redirect(await resolvePostLoginRoute(supabase))

  }



  return (

    <>

      <LandingJsonLd />

      <LandingPage />

    </>

  )

}



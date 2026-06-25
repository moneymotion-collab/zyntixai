import Link from "next/link"
import ConversionCtaBand from "@/components/landing/ConversionCtaBand"
import DemoVideoSection from "@/components/landing/DemoVideoSection"
import FeaturesGrid from "@/components/landing/FeaturesGrid"
import HeroSection from "@/components/landing/HeroSection"
import LandingFaqSection from "@/components/landing/LandingFaqSection"
import LandingFooter from "@/components/landing/LandingFooter"
import LandingHeader from "@/components/landing/LandingHeader"
import MarketingAIShowcase from "@/components/landing/MarketingAIShowcase"
import MobileLandingCta from "@/components/landing/MobileLandingCta"
import ProblemSolutionSection from "@/components/landing/ProblemSolutionSection"
import ProductPreviewSection from "@/components/landing/ProductPreviewSection"
import ResultsSection from "@/components/landing/ResultsSection"
import SocialProofSection from "@/components/landing/SocialProofSection"
import WaitlistSignup from "@/components/landing/WaitlistSignup"

export default function LandingPage() {
  return (
    <div className="relative w-full overflow-x-hidden bg-[#06080f] pb-24 text-white sm:pb-0">
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-[520px] w-[520px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[40%] right-[-120px] h-[420px] w-[420px] rounded-full bg-purple-500/20 blur-[120px]" />

      <LandingHeader />
      <HeroSection />

      <MobileLandingCta />

      <section className="relative z-10 border-t border-white/10 px-4 py-5 sm:py-6">
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </section>

      <ProblemSolutionSection />
      <ProductPreviewSection />
      <FeaturesGrid />

      <ConversionCtaBand variant="compact" />

      <WaitlistSignup />

      <MarketingAIShowcase />
      <ResultsSection />
      <DemoVideoSection />
      <SocialProofSection />

      <LandingFaqSection />

      <ConversionCtaBand />

      <LandingFooter />
    </div>
  )
}

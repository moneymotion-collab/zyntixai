import Link from "next/link"
import MarketingLegalSection from "@/components/landing/MarketingLegalSection"
import MarketingPageShell from "@/components/landing/MarketingPageShell"
import { LEGAL_LAST_UPDATED, SITE_CONTACT } from "@/lib/landing/site-contact"
import { FITCORE_AI_BRAND_NAME } from "@/lib/brand/fitcore-ai"
import { COACH_TRIAL_DAYS } from "@/lib/coach-trial"

export default function TermsPage() {
  return (
    <MarketingPageShell
      badge="Legal"
      title="Terms of Service"
      description={`Terms governing your use of ${FITCORE_AI_BRAND_NAME}.`}
      narrow
    >
      <div className="glass-panel rounded-2xl border-white/12 p-5 sm:p-8">
        <p className="text-sm text-slate-500">Last updated: {LEGAL_LAST_UPDATED}</p>

        <MarketingLegalSection title="1. Agreement">
          <p>
            By accessing or using {FITCORE_AI_BRAND_NAME}, you agree to these
            Terms of Service. If you do not agree, do not use the service. If
            you use the platform on behalf of a business, you represent that you
            have authority to bind that business.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="2. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Use the service for unlawful, harmful, or fraudulent purposes.</li>
            <li>Upload content that infringes intellectual property or privacy rights.</li>
            <li>Attempt to access accounts or systems without authorization.</li>
            <li>Interfere with platform security, performance, or other users.</li>
            <li>Resell or sublicense the service except as expressly permitted.</li>
          </ul>
          <p>
            We may suspend or terminate accounts that violate these rules or pose
            a risk to the platform or other users.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="3. Subscriptions and billing">
          <p>
            Paid plans are billed on a recurring subscription basis through our
            payment processor. Prices, features, and plan limits are described on
            our{" "}
            <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300">
              pricing page
            </Link>
            . Taxes may apply depending on your location.
          </p>
          <p>
            By subscribing, you authorize us and our payment provider to charge your
            payment method on a recurring basis until you cancel. Failed payments
            may result in restricted access until resolved.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="4. Free trial">
          <p>
            New accounts may include a {COACH_TRIAL_DAYS}-day free trial with access
            to platform features. No credit card is required to start a trial
            through account registration unless you choose to subscribe during the
            trial.
          </p>
          <p>
            At the end of the trial, continued access to paid features may require
            an active subscription. Trial eligibility and scope may change for
            future sign-ups.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="5. Cancellation">
          <p>
            You may cancel a paid subscription at any time from your account or by
            contacting{" "}
            <a
              href={`mailto:${SITE_CONTACT.supportEmail}`}
              className="text-indigo-400 hover:text-indigo-300"
            >
              {SITE_CONTACT.supportEmail}
            </a>
            . Cancellation stops future billing; access typically continues until
            the end of the current billing period unless otherwise stated.
          </p>
          <p>
            You may delete your account by contacting support. Some data may be
            retained as required by law or for legitimate business purposes.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="6. Intellectual property">
          <p>
            We own the platform, branding, and underlying technology. You retain
            ownership of content you upload. You grant us a limited license to
            host, process, and display your content solely to operate the service.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="7. Disclaimer and limitation of liability">
          <p>
            The service is provided on an &quot;as is&quot; and &quot;as available&quot;
            basis. To the fullest extent permitted by law, we disclaim warranties
            of merchantability, fitness for a particular purpose, and
            non-infringement.
          </p>
          <p>
            {FITCORE_AI_BRAND_NAME} is a software tool. We do not provide medical,
            nutritional, or fitness advice. Coaches remain responsible for their
            professional judgments and client relationships.
          </p>
          <p>
            To the maximum extent permitted by law, we are not liable for indirect,
            incidental, special, consequential, or punitive damages, or for loss of
            profits, data, or goodwill. Our total liability for claims relating to
            the service is limited to the amount you paid us in the twelve (12)
            months before the claim arose, or €100 if no fees were paid.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="8. Changes">
          <p>
            We may update these Terms from time to time. Material changes will be
            communicated via the website or email where appropriate. Continued use
            after changes take effect constitutes acceptance.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="9. Contact">
          <p>
            Questions about these Terms:{" "}
            <a
              href={`mailto:${SITE_CONTACT.supportEmail}`}
              className="text-indigo-400 hover:text-indigo-300"
            >
              {SITE_CONTACT.supportEmail}
            </a>
            . See our{" "}
            <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">
              Privacy Policy
            </Link>
            .
          </p>
        </MarketingLegalSection>
      </div>
    </MarketingPageShell>
  )
}

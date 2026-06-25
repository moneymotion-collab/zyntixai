import Link from "next/link"
import MarketingLegalSection from "@/components/landing/MarketingLegalSection"
import MarketingPageShell from "@/components/landing/MarketingPageShell"
import { LEGAL_LAST_UPDATED, SITE_CONTACT } from "@/lib/landing/site-contact"
import { FITCORE_AI_BRAND_NAME } from "@/lib/brand/fitcore-ai"

export default function PrivacyPage() {
  return (
    <MarketingPageShell
      badge="Legal"
      title="Privacy Policy"
      description={`How ${FITCORE_AI_BRAND_NAME} collects, uses, and protects your information.`}
      narrow
    >
      <div className="glass-panel rounded-2xl border-white/12 p-5 sm:p-8">
        <p className="text-sm text-slate-500">Last updated: {LEGAL_LAST_UPDATED}</p>

        <MarketingLegalSection title="1. Introduction">
          <p>
            {FITCORE_AI_BRAND_NAME} (&quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;) provides a coaching platform for fitness
            professionals. This Privacy Policy explains how we process personal
            data when you visit our website, create an account, or use our
            services.
          </p>
          <p>
            We process personal data in accordance with applicable data
            protection laws, including the EU General Data Protection Regulation
            (GDPR) where it applies.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="2. Data we collect">
          <p>We may collect the following categories of information:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-slate-300">Account information</strong>{" "}
              — name, email address, role, password (stored in hashed form),
              and profile details you provide.
            </li>
            <li>
              <strong className="text-slate-300">Coaching data</strong> — client
              records, workouts, nutrition plans, progress logs, notes, and
              content you upload or create in the platform.
            </li>
            <li>
              <strong className="text-slate-300">Billing data</strong> — subscription
              status and payment-related identifiers processed by our payment
              provider (we do not store full card numbers).
            </li>
            <li>
              <strong className="text-slate-300">Usage data</strong> — log data,
              device/browser type, IP address, and interactions with features.
            </li>
            <li>
              <strong className="text-slate-300">Communications</strong> — messages
              you send to support or through contact forms.
            </li>
          </ul>
        </MarketingLegalSection>

        <MarketingLegalSection title="3. Cookies">
          <p>
            We use essential cookies and similar technologies to keep you signed
            in, maintain session security, and remember preferences required for
            the service to function.
          </p>
          <p>
            Where non-essential cookies or analytics tools are used, we will
            request consent where required by law. You can control cookies through
            your browser settings, though disabling essential cookies may affect
            functionality.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="4. Analytics">
          <p>
            We may use analytics to understand how our website and product are
            used — for example, page views, feature adoption, and error
            monitoring. Analytics data is aggregated where possible and used to
            improve performance, reliability, and user experience.
          </p>
          <p>
            When analytics involves third-party processors, we limit data shared
            to what is necessary and apply appropriate contractual safeguards.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="5. Account information">
          <p>
            Information associated with your account is used to authenticate you,
            deliver the service, provide support, enforce our terms, and
            communicate important product or billing updates.
          </p>
          <p>
            If you are a coach, you are responsible for ensuring you have a
            lawful basis to process your clients&apos; data within {FITCORE_AI_BRAND_NAME}
            , including providing any required notices to your clients.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="6. Legal bases (GDPR)">
          <p>Where GDPR applies, we rely on the following legal bases:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-slate-300">Contract</strong> — to provide
              the platform and account features you request.
            </li>
            <li>
              <strong className="text-slate-300">Legitimate interests</strong> —
              to secure, improve, and market our service in a balanced way.
            </li>
            <li>
              <strong className="text-slate-300">Consent</strong> — where
              required for optional cookies, marketing communications, or
              integrations you connect.
            </li>
            <li>
              <strong className="text-slate-300">Legal obligation</strong> — where
              we must retain or disclose data to comply with law.
            </li>
          </ul>
        </MarketingLegalSection>

        <MarketingLegalSection title="7. Your rights">
          <p>
            Depending on your location, you may have the right to access,
            rectify, erase, restrict, or port your personal data, and to object
            to certain processing. You may also withdraw consent where processing
            is consent-based.
          </p>
          <p>
            To exercise your rights, contact{" "}
            <a
              href={`mailto:${SITE_CONTACT.privacyEmail}`}
              className="text-indigo-400 hover:text-indigo-300"
            >
              {SITE_CONTACT.privacyEmail}
            </a>
            . You also have the right to lodge a complaint with your local data
            protection authority.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="8. Retention and security">
          <p>
            We retain personal data only as long as needed for the purposes
            described in this policy, including legal, accounting, and security
            requirements. We implement technical and organizational measures
            designed to protect data against unauthorized access, loss, or misuse.
          </p>
        </MarketingLegalSection>

        <MarketingLegalSection title="9. Contact">
          <p>
            For privacy questions or requests, email{" "}
            <a
              href={`mailto:${SITE_CONTACT.privacyEmail}`}
              className="text-indigo-400 hover:text-indigo-300"
            >
              {SITE_CONTACT.privacyEmail}
            </a>
            . For general enquiries, contact{" "}
            <a
              href={`mailto:${SITE_CONTACT.helloEmail}`}
              className="text-indigo-400 hover:text-indigo-300"
            >
              {SITE_CONTACT.helloEmail}
            </a>
            .
          </p>
          <p>
            See also our{" "}
            <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">
              Terms of Service
            </Link>
            .
          </p>
        </MarketingLegalSection>
      </div>
    </MarketingPageShell>
  )
}

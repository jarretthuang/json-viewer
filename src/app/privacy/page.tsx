/* Starting draft only; not legal advice. Review before publication. */
import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How JSON Viewer handles your data and uses analytics.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        JSON Viewer is operated by Jarrett Huang. This policy explains how
        information is handled when you use jsonviewer.io.
      </p>
      <section>
        <h2>Your JSON and shared URLs</h2>
        <p>
          JSON editing, validation, formatting, and tree exploration run in your
          browser. The app can encode JSON in the URL to preserve and share it.
          These URLs can appear in browser history, hosting logs, and anywhere
          you share them. Anyone with the URL can read the included JSON. Avoid
          using passwords, API keys, or other sensitive information in shared
          URLs.
        </p>
      </section>
      <section>
        <h2>Vercel Analytics and hosting</h2>
        <p>
          We use Vercel Web Analytics to understand site traffic and improve
          JSON Viewer. It collects usage information such as page views,
          referring sites, browser and device types, and country. Vercel
          describes Web Analytics as using anonymized data without analytics
          cookies. Learn more in the{" "}
          <a href="https://vercel.com/docs/analytics/privacy-policy">
            Vercel Analytics privacy documentation
          </a>
          .
        </p>
        <p>
          Vercel also hosts the site and may process technical request
          information, including IP addresses and URLs, to deliver and secure
          the service. See the{" "}
          <a href="https://vercel.com/legal/privacy-notice">
            Vercel Privacy Notice
          </a>
          .
        </p>
      </section>
      <section>
        <h2>Preferences and diagnostics</h2>
        <p>
          Your browser stores your theme preference locally. When error
          reporting is enabled, we use Sentry to receive error reports and
          technical context to diagnose problems. Reports may include request
          URLs and browser information. Session replay is not enabled.
        </p>
      </section>
      <section>
        <h2>Support and purchases</h2>
        <p>
          If you contact support, we receive your email address and any
          information you provide. For Pro purchases and refunds, order and
          license information may be used to verify your purchase and handle
          your request. Payment providers process payment details under their
          own privacy policies. Please do not send payment card details or
          sensitive JSON by email.
        </p>
      </section>
      <section>
        <h2>Use, retention, and your choices</h2>
        <p>
          We use information to operate, secure, and improve the service,
          provide support, and handle purchases. We retain it as needed for
          those purposes and applicable recordkeeping requirements. Service
          providers may process information in other countries. We do not sell
          your personal information.
        </p>
        <p>
          You can clear browser storage to remove saved preferences. To request
          access to, correction of, or deletion of personal information, contact{" "}
          <a href="mailto:support@jsonviewer.io">support@jsonviewer.io</a>. Available
          rights and any exceptions depend on applicable law.
        </p>
      </section>
      <section>
        <h2>Changes and contact</h2>
        <p>
          We may update this policy as the service changes. Updates will appear
          on this page. For privacy questions, email{" "}
          <a href="mailto:support@jsonviewer.io">support@jsonviewer.io</a>.
        </p>
      </section>
    </LegalPage>
  );
}

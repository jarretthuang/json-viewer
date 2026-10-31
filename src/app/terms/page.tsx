/* Starting draft only; not legal advice. Review before publication. */
import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using JSON Viewer and the Pro license refund policy.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms govern your use of JSON Viewer, operated by Jarrett Huang.
        By using the service, you agree to these terms.
      </p>
      <section>
        <h2>Using JSON Viewer</h2>
        <p>
          You may use JSON Viewer to edit, validate, format, and explore JSON
          for lawful purposes. You are responsible for your data and for having
          the right to use it. Do not disrupt the service, attempt unauthorized
          access, or use it to harm others. You retain ownership of your JSON.
        </p>
      </section>
      <section>
        <h2>Pro digital license</h2>
        <p>
          JSON Viewer Pro is a digital license priced at USD 29 as a one-time
          payment, not a recurring subscription. Applicable taxes, if any, are
          shown at checkout. Your purchase provides access to the Pro features
          described at the time of purchase. It does not transfer ownership of
          the service or permit resale of license keys, and does not promise
          indefinite hosting or every future product or feature.
        </p>
      </section>
      <section>
        <h2>Refund policy</h2>
        <p>
          You may request a full refund of your USD 29 one-time Pro digital
          license within 14 days of purchase by emailing{" "}
          <a href="mailto:support@jhuang.ca">support@jhuang.ca</a> with your
          order reference and purchase email address. You do not need to provide
          a reason. Do not include payment card details.
        </p>
        <p>
          Approved refunds are returned to the original payment method;
          processing time depends on the payment provider. The refunded Pro
          license will be deactivated. After 14 days, purchases are generally
          non-refundable, except where required by law. Contact support for
          duplicate charges or problems accessing your purchase. This policy
          does not limit any mandatory consumer rights.
        </p>
      </section>
      <section>
        <h2>Privacy and your data</h2>
        <p>
          Our <a href="/privacy">Privacy Policy</a> explains data handling and
          analytics. Shared URLs can contain your JSON. Keep your own backups
          and check outputs before relying on them.
        </p>
      </section>
      <section>
        <h2>Availability and responsibility</h2>
        <p>
          The service is provided as available, without a guarantee of
          uninterrupted operation or error-free results. To the extent permitted
          by law, we disclaim implied warranties and liability for indirect or
          consequential losses from use of the service. Nothing in these terms
          excludes rights, warranties, or liability that cannot legally be
          excluded.
        </p>
      </section>
      <section>
        <h2>Changes and contact</h2>
        <p>
          We may update the service and these terms. Revised terms will be
          posted here; changes do not remove refund rights for existing
          purchases. For support, license questions, or concerns about these
          terms, email <a href="mailto:support@jhuang.ca">support@jhuang.ca</a>.
        </p>
      </section>
    </LegalPage>
  );
}

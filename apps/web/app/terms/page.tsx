import { LegalLayout } from "@/components/legal/LegalLayout";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="5 July 2026">
      <p>
        By using Gercep AI (&quot;Service&quot;), you agree to these terms. If you
        do not agree, do not use the Service.
      </p>

      <h2 className="text-lg font-semibold text-white">Service description</h2>
      <p>
        Gercep AI provides an OpenAI-compatible API gateway for LLM inference,
        API key management, usage metering, and optional Solana wallet linking for
        quota tiers. Models are provided by third-party inference providers.
      </p>

      <h2 className="text-lg font-semibold text-white">Your responsibilities</h2>
      <ul className="list-inside list-disc space-y-1">
        <li>Keep your account credentials and API keys secure</li>
        <li>Do not share plain API keys publicly or commit them to git</li>
        <li>Comply with applicable laws and provider acceptable-use policies</li>
        <li>Do not abuse the gateway (spam, illegal content, credential stuffing)</li>
      </ul>

      <h2 className="text-lg font-semibold text-white">API keys &amp; quotas</h2>
      <p>
        API keys are personal to your account. Daily request limits apply per tier
        (see Whitepaper). We may suspend keys or accounts that violate these terms
        or exceed fair use.
      </p>

      <h2 className="text-lg font-semibold text-white">$GERCEP token</h2>
      <p>
        References to $GERCEP describe planned ecosystem utility. Token launch,
        allocation, and vesting are described in our Whitepaper and are subject to
        change. Nothing here is financial advice or an offer of securities.
      </p>

      <h2 className="text-lg font-semibold text-white">Disclaimer</h2>
      <p>
        The Service is provided &quot;as is&quot; without warranties. We are not
        liable for model output accuracy, provider outages, or indirect damages.
        Inference results may be incorrect — verify before production use.
      </p>

      <h2 className="text-lg font-semibold text-white">Changes</h2>
      <p>
        We may update these terms. Continued use after changes constitutes
        acceptance. Material changes will be noted on this page.
      </p>
    </LegalLayout>
  );
}

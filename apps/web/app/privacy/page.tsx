import { LegalLayout } from "@/components/legal/LegalLayout";

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="5 July 2026">
      <p>
        Gercep AI (&quot;we&quot;, &quot;us&quot;) operates the inference gateway
        at gercep.ai and related subdomains. This policy describes how we handle
        data when you use our developer platform.
      </p>

      <h2 className="text-lg font-semibold text-white">Data we collect</h2>
      <ul className="list-inside list-disc space-y-1">
        <li>Account email and password (Supabase Auth)</li>
        <li>API key metadata (hashed keys, prefixes, usage timestamps)</li>
        <li>Usage logs: model, token counts, API key ID, timestamps</li>
        <li>Linked Solana wallet address (if you choose to connect Phantom)</li>
        <li>Prompt and completion content sent through the gateway (processed to fulfill API requests)</li>
      </ul>

      <h2 className="text-lg font-semibold text-white">How we use data</h2>
      <ul className="list-inside list-disc space-y-1">
        <li>Authenticate API requests and enforce daily quotas</li>
        <li>Route inference to model providers (e.g. DeepSeek)</li>
        <li>Display usage statistics on your Developers dashboard</li>
        <li>Improve reliability and prevent abuse</li>
      </ul>

      <h2 className="text-lg font-semibold text-white">Third parties</h2>
      <p>
        We use Supabase (database &amp; auth), Vercel (hosting), DeepSeek (model
        inference), and Solana RPC providers when reading wallet balances. Provider
        keys are stored server-side only — never exposed to clients.
      </p>

      <h2 className="text-lg font-semibold text-white">Retention</h2>
      <p>
        Usage logs are retained while your account is active. You may revoke API
        keys or unlink your wallet from the Developers page. Contact us to request
        account deletion.
      </p>

      <h2 className="text-lg font-semibold text-white">Contact</h2>
      <p>
        Questions: reach out via your Gercep account channel or project GitHub
        repository. This is a draft policy and may be updated before public launch.
      </p>
    </LegalLayout>
  );
}

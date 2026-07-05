import Link from "next/link";
import { DocsCode } from "@/components/docs/CodeBlock";
import { Card } from "@/components/ui/Card";
import { listPublicModels } from "@/lib/gateway/models";

const CURL_CHAT = `curl {{BASE_URL}}/api/v1/chat/completions \\
  -H "Authorization: Bearer sk-gercep-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}]
  }'`;

const OPENAI_NODE = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-gercep-YOUR_KEY",
  baseURL: "{{BASE_URL}}/api/v1",
});

const completion = await client.chat.completions.create({
  model: "deepseek-chat",
  messages: [{ role: "user", content: "Hello" }],
});

console.log(completion.choices[0].message.content);`;

const OPENAI_PYTHON = `from openai import OpenAI

client = OpenAI(
    api_key="sk-gercep-YOUR_KEY",
    base_url="{{BASE_URL}}/api/v1",
)

completion = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Hello"}],
)

print(completion.choices[0].message.content)`;

const CURL_MODELS = `curl {{BASE_URL}}/api/v1/models`;

export default function DocsPage() {
  const models = listPublicModels();

  return (
    <div className="bg-[#070711] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-bold"
            >
              Gercep AI
            </Link>
            <p className="text-sm text-white/50">API Documentation</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/playground"
              className="text-sm text-white/60 transition hover:text-white"
            >
              Playground
            </Link>
            <Link
              href="/developers"
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/30"
            >
              API Keys
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 pb-20">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          Gercep Gateway API
        </h1>
        <p className="mt-3 text-white/60">
          OpenAI-compatible inference gateway. Satu base URL, satu{" "}
          <code className="text-[#2DD4BF]">sk-gercep-</code> API key — request
          shape sama persis dengan OpenAI.
        </p>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Quick start
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-white/70">
            <li>
              Buat akun & login →{" "}
              <Link href="/developers" className="text-[#2DD4BF] hover:underline">
                Create API Key
              </Link>
            </li>
            <li>
              Test di{" "}
              <Link href="/playground" className="text-[#2DD4BF] hover:underline">
                Playground
              </Link>{" "}
              atau langsung hit API
            </li>
            <li>
              Set <code className="text-white/80">baseURL</code> ke{" "}
              <code className="text-white/80">/api/v1</code> di OpenAI SDK
            </li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Authentication
          </h2>
          <p className="mt-3 text-sm text-white/60">
            Semua request ke gateway wajib header{" "}
            <code className="text-white/80">Authorization: Bearer sk-gercep-...</code>
            . Key dibuat di halaman Developers — plain key hanya ditampilkan sekali
            saat create.
          </p>
        </section>

        <Card title="POST /api/v1/chat/completions" className="mt-10">
          <p className="mb-4 text-sm text-white/50">
            Kirim chat completion. Response shape compatible dengan OpenAI Chat
            Completions API.
          </p>
          <DocsCode template={CURL_CHAT} />
        </Card>

        <Card title="OpenAI SDK — Node.js" className="mt-6">
          <p className="mb-4 text-sm text-white/50">
            Install: <code className="text-white/70">npm install openai</code>
          </p>
          <DocsCode template={OPENAI_NODE} language="typescript" />
        </Card>

        <Card title="OpenAI SDK — Python" className="mt-6">
          <p className="mb-4 text-sm text-white/50">
            Install: <code className="text-white/70">pip install openai</code>
          </p>
          <DocsCode template={OPENAI_PYTHON} language="python" />
        </Card>

        <Card title="GET /api/v1/models" className="mt-6">
          <p className="mb-4 text-sm text-white/50">
            List model yang tersedia. Tidak perlu API key.
          </p>
          <DocsCode template={CURL_MODELS} />
        </Card>

        <Card title="Available models" className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                  <th className="pb-2 pr-4 font-medium">Model ID</th>
                  <th className="pb-2 pr-4 font-medium">Provider</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {models.map((m) => (
                  <tr key={m.id}>
                    <td className="py-2.5 pr-4 font-mono text-xs">{m.id}</td>
                    <td className="py-2.5 pr-4 text-white/60">{m.owned_by}</td>
                    <td className="py-2.5">
                      <span
                        className={
                          m.status === "live"
                            ? "text-[#2DD4BF]"
                            : "text-white/40"
                        }
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Usage & billing" className="mt-6">
          <p className="text-sm text-white/60">
            Setiap completion di-log ke dashboard di{" "}
            <Link href="/developers" className="text-[#2DD4BF] hover:underline">
              /developers
            </Link>
            . Token usage (prompt, completion, total) tersedia per request dan
            per API key. Billing credits & $GERCEP — coming soon.
          </p>
        </Card>

        <Card title="Errors" className="mt-6">
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <code className="text-[#F472B6]">401</code> — Missing or invalid API
              key
            </li>
            <li>
              <code className="text-[#F472B6]">400</code> — Invalid request body
              (model, messages)
            </li>
            <li>
              <code className="text-[#F472B6]">502</code> — Upstream provider error
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
}

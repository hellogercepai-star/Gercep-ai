"use client";

import Link from "next/link";
import { DocsCode } from "@/components/docs/CodeBlock";
import { DocsHeaderActions } from "@/components/docs/DocsHeaderActions";
import { useLanguage } from "@/components/i18n/LanguageProvider";
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

export function DocsPageContent() {
  const { t } = useLanguage();
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
            <p className="text-sm text-white/50">{t("docs.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <DocsHeaderActions />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 pb-20">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
          {t("docs.title")}
        </h1>
        <p className="mt-3 text-white/60">{t("docs.intro")}</p>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {t("docs.quickstartTitle")}
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-white/70">
            <li>
              {t("docs.quickstartStep1")}{" "}
              <Link href="/developers" className="text-[#2DD4BF] hover:underline">
                {t("common.createApiKey")}
              </Link>
            </li>
            <li>
              {t("docs.quickstartStep2")}{" "}
              <Link href="/playground" className="text-[#2DD4BF] hover:underline">
                {t("common.playground")}
              </Link>{" "}
              {t("docs.quickstartStep2Suffix")}
            </li>
            <li>{t("docs.quickstartStep3")}</li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {t("docs.authTitle")}
          </h2>
          <p className="mt-3 text-sm text-white/60">{t("docs.authDesc")}</p>
        </section>

        <Card title={t("docs.chatEndpointTitle")} className="mt-10">
          <p className="mb-4 text-sm text-white/50">{t("docs.chatEndpointDesc")}</p>
          <DocsCode template={CURL_CHAT} />
        </Card>

        <Card title={t("docs.nodeSdkTitle")} className="mt-6">
          <p className="mb-4 text-sm text-white/50">{t("docs.nodeSdkDesc")}</p>
          <DocsCode template={OPENAI_NODE} language="typescript" />
        </Card>

        <Card title={t("docs.pythonSdkTitle")} className="mt-6">
          <p className="mb-4 text-sm text-white/50">{t("docs.pythonSdkDesc")}</p>
          <DocsCode template={OPENAI_PYTHON} language="python" />
        </Card>

        <Card title={t("docs.modelsEndpointTitle")} className="mt-6">
          <p className="mb-4 text-sm text-white/50">
            {t("docs.modelsEndpointDesc")}
          </p>
          <DocsCode template={CURL_MODELS} />
        </Card>

        <Card title={t("docs.availableModelsTitle")} className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-white/40">
                  <th className="pb-2 pr-4 font-medium">
                    {t("docs.tableModelId")}
                  </th>
                  <th className="pb-2 pr-4 font-medium">
                    {t("docs.tableProvider")}
                  </th>
                  <th className="pb-2 font-medium">{t("docs.tableStatus")}</th>
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

        <Card title={t("docs.usageTitle")} className="mt-6">
          <p className="text-sm text-white/60">
            {t("docs.usageDesc")}{" "}
            <Link href="/developers" className="text-[#2DD4BF] hover:underline">
              /developers
            </Link>
            .
          </p>
        </Card>

        <Card title={t("docs.errorsTitle")} className="mt-6">
          <ul className="space-y-2 text-sm text-white/60">
            <li>
              <code className="text-[#F472B6]">401</code> — {t("docs.error401")}
            </li>
            <li>
              <code className="text-[#F472B6]">400</code> — {t("docs.error400")}
            </li>
            <li>
              <code className="text-[#F472B6]">402</code> — {t("docs.error402")}
            </li>
            <li>
              <code className="text-[#F472B6]">429</code> — {t("docs.error429")}
            </li>
            <li>
              <code className="text-[#F472B6]">502</code> — {t("docs.error502")}
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
}

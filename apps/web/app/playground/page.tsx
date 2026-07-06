"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface ModelInfo {
  id: string;
  owned_by: string;
  status: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#2DD4BF]/50";

export default function PlaygroundPage() {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("gercep_api_key") ?? "";
  });
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [model, setModel] = useState("deepseek-chat");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsage, setLastUsage] = useState<number | null>(null);

  useEffect(() => {
    async function loadModels() {
      try {
        const r = await fetch("/api/v1/models");
        const data = await r.json();
        const list = (data.data ?? []) as ModelInfo[];
        setModels(list);
        const fromUrl = new URLSearchParams(window.location.search).get("model");
        if (fromUrl && list.some((m) => m.id === fromUrl)) {
          setModel(fromUrl);
        } else if (list[0]) {
          setModel(list[0].id);
        }
      } catch {
        // models endpoint optional saat offline
      }
    }
    loadModels();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!apiKey.trim()) {
      setError(t("playground.apiKeyRequired"));
      return;
    }
    if (!prompt.trim()) return;

    localStorage.setItem("gercep_api_key", apiKey.trim());
    setLoading(true);
    setError(null);

    const userMessage: ChatMessage = { role: "user", content: prompt.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    try {
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: userMessage.content }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message ?? t("playground.requestFailed"));
      }

      const reply = data.choices?.[0]?.message?.content ?? t("playground.emptyReply");
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setLastUsage(data.usage?.total_tokens ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("playground.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#070711] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-bold"
            >
              Gercep AI
            </Link>
            <p className="text-sm text-white/50">{t("playground.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
            <Link href="/docs">
              <Button variant="ghost" size="sm">
                {t("common.docs")}
              </Button>
            </Link>
            <Link href="/developers">
              <Button variant="secondary" size="sm">
                {t("common.apiKeys")}
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                {t("common.dashboard")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 pb-20">
        <Card
          title={t("playground.title")}
          description={t("playground.desc")}
          className="mb-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                {t("playground.apiKey")}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (error?.includes("API Key")) setError(null);
                }}
                placeholder="sk-gercep-..."
                className={`${inputClass} ${!apiKey.trim() ? "border-[#F472B6]/40" : ""}`}
                required
              />
              {!apiKey.trim() && (
                <p className="mt-1 text-xs text-[#F472B6]">
                  {t("playground.apiKeyEmpty")}
                </p>
              )}
              <p className="mt-1 text-xs text-white/40">
                {t("playground.createKeyAt")}{" "}
                <Link href="/developers" className="text-[#2DD4BF] underline">
                  Developers
                </Link>
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/70">
                {t("playground.model")}
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={`${inputClass} bg-[#070711]`}
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} ({m.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card className="mb-4 min-h-[280px]">
          {messages.length === 0 ? (
            <p className="text-sm text-white/40">{t("playground.emptyChat")}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "ml-8 bg-white/[0.06]"
                      : "mr-8 border border-[#2DD4BF]/20 bg-[#2DD4BF]/5"
                  }`}
                >
                  <span className="mb-1 block text-xs uppercase text-white/40">
                    {msg.role === "user" ? t("common.you") : t("common.assistant")}
                  </span>
                  {msg.content}
                </div>
              ))}
            </div>
          )}
          {lastUsage !== null && (
            <p className="mt-4 text-xs text-white/40">
              {t("playground.lastRequest")}: {lastUsage} tokens
            </p>
          )}
        </Card>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("playground.promptPlaceholder")}
            className={`${inputClass} flex-1`}
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading || !prompt.trim() || !apiKey.trim()}
          >
            {loading ? "..." : t("common.send")}
          </Button>
        </form>

        {error && <p className="mt-3 text-sm text-[#F472B6]">{error}</p>}
      </main>
    </div>
  );
}

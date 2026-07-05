"use client";

import { FormEvent, KeyboardEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface ModelInfo {
  id: string;
  status: string;
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#2DD4BF]/50";

export function HeroPlayground() {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState("");
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [model, setModel] = useState("deepseek-chat");
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("gercep_api_key");
    if (saved) setApiKey(saved);

    fetch("/api/v1/models")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.data ?? []) as ModelInfo[];
        const live = list.filter((m) => m.status === "live");
        setModels(live);
        const fromUrl = new URLSearchParams(window.location.search).get("model");
        if (fromUrl && live.some((m) => m.id === fromUrl)) {
          setModel(fromUrl);
        } else if (live[0]) {
          setModel(live[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const submit = async () => {
    if (loading || !prompt.trim()) return;
    if (!apiKey.trim()) {
      setError(t("heroPlayground.apiKeyRequired"));
      return;
    }

    localStorage.setItem("gercep_api_key", apiKey.trim());
    setLoading(true);
    setError(null);
    setReply(null);

    try {
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt.trim() }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? t("playground.requestFailed"));
      setReply(data.choices?.[0]?.message?.content ?? t("playground.emptyReply"));
      setTokens(data.usage?.total_tokens ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("playground.genericError"));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const modelLabel = models.find((m) => m.id === model)?.id ?? model;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#2DD4BF]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#2DD4BF]">
            {t("common.chat")}
          </span>
          <span className="font-mono text-xs text-white/60">{modelLabel}</span>
        </div>
        <Link
          href="/playground"
          className="text-[10px] uppercase tracking-wider text-white/40 transition hover:text-white"
        >
          {t("heroPlayground.apiView")}
        </Link>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            if (error) setError(null);
          }}
          placeholder={t("heroPlayground.apiKeyPlaceholder")}
          className={inputClass}
        />
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className={`${inputClass} bg-[#070711]`}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 min-h-[120px] rounded-lg border border-white/5 bg-black/20 p-3">
        {reply ? (
          <p className="text-sm leading-relaxed text-white/80">{reply}</p>
        ) : (
          <p className="text-sm text-white/35">
            {t("heroPlayground.emptyDraft")}
          </p>
        )}
        {tokens !== null && (
          <p className="mt-2 text-[10px] text-white/30">
            {tokens} {t("common.tokens")}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={onKeyDown}
          rows={2}
          placeholder={t("heroPlayground.promptPlaceholder")}
          className={`${inputClass} resize-none`}
          disabled={loading}
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[10px] text-white/35">
            {t("heroPlayground.createKeyAt")}{" "}
            <Link href="/developers" className="text-[#2DD4BF] hover:underline">
              {t("common.developers")}
            </Link>
          </p>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-[#070711] transition hover:bg-white/90 disabled:opacity-40"
          >
            {loading ? "..." : t("common.send")}
          </button>
        </div>
      </form>

      {error && <p className="mt-2 text-xs text-[#F472B6]">{error}</p>}
    </div>
  );
}

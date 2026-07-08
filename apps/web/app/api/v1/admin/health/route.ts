import { NextResponse } from "next/server";
import { withAdminDb } from "@/lib/gateway/admin-handler";

type ProviderProbe = {
  slug: string;
  modelsUrl: string;
  apiKeyEnv: string;
};

const UPSTREAM_PROBES: ProviderProbe[] = [
  {
    slug: "deepseek",
    modelsUrl: "https://api.deepseek.com/v1/models",
    apiKeyEnv: "DEEPSEEK_API_KEY",
  },
  {
    slug: "openai",
    modelsUrl: "https://api.openai.com/v1/models",
    apiKeyEnv: "OPENAI_API_KEY",
  },
  {
    slug: "gemini",
    modelsUrl: "https://generativelanguage.googleapis.com/v1beta/openai/models",
    apiKeyEnv: "GOOGLE_API_KEY",
  },
  {
    slug: "grok",
    modelsUrl: "https://api.x.ai/v1/models",
    apiKeyEnv: "XAI_API_KEY",
  },
  {
    slug: "nvidia",
    modelsUrl: "https://integrate.api.nvidia.com/v1/models",
    apiKeyEnv: "NVIDIA_API_KEY",
  },
];

async function probeProvider(probe: ProviderProbe) {
  const apiKey = process.env[probe.apiKeyEnv];
  if (!apiKey) {
    return {
      status: "not_configured" as const,
      latencyMs: 0,
      error: `${probe.apiKeyEnv} not set`,
    };
  }

  const started = Date.now();
  try {
    const res = await fetch(probe.modelsUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    const latencyMs = Date.now() - started;
    return {
      status: res.ok ? ("ok" as const) : ("degraded" as const),
      latencyMs,
      error: res.ok ? null : `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      status: "degraded" as const,
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.message : "Unreachable",
    };
  }
}

export async function GET(request: Request) {
  return withAdminDb(request as import("next/server").NextRequest, async () => {
    const providers = Object.fromEntries(
      await Promise.all(
        UPSTREAM_PROBES.map(async (probe) => [
          probe.slug,
          await probeProvider(probe),
        ])
      )
    );

    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      gateway: { status: "ok" },
      providers,
    });
  });
}

import { NextResponse } from "next/server";
import { withAdminDb } from "@/lib/gateway/admin-handler";

export async function GET(request: Request) {
  return withAdminDb(request as import("next/server").NextRequest, async () => {
    const started = Date.now();
    let providerOk = false;
    let providerLatencyMs = 0;
    let providerError: string | null = null;

    try {
      const res = await fetch("https://api.deepseek.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY ?? ""}`,
        },
        signal: AbortSignal.timeout(8000),
      });
      providerLatencyMs = Date.now() - started;
      providerOk = res.ok;
      if (!res.ok) providerError = `HTTP ${res.status}`;
    } catch (err) {
      providerLatencyMs = Date.now() - started;
      providerError = err instanceof Error ? err.message : "Unreachable";
    }

    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      gateway: { status: "ok" },
      deepseek: {
        status: providerOk ? "ok" : "degraded",
        latencyMs: providerLatencyMs,
        error: providerError,
      },
    });
  });
}

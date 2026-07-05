import { NextResponse } from "next/server";
import { listPublicModels } from "@/lib/gateway/models";

// GET /api/v1/models — model discovery (OpenAI-compatible shape)
export async function GET() {
  const models = listPublicModels();
  return NextResponse.json({
    object: "list",
    data: models,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { AdminRepository } from "@/lib/repositories/admin.repository";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

/** POST /api/v1/webhooks/stripe — credit user balance on successful payment */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const amountUsd = Number(session.metadata?.amountUsd);

    if (userId && amountUsd > 0) {
      const db = createAdminClient();
      const repo = new AdminRepository(db);
      await repo.topUpBalance(
        userId,
        amountUsd,
        `Stripe checkout ${session.id}`,
        "stripe"
      );
    }
  }

  return NextResponse.json({ received: true });
}

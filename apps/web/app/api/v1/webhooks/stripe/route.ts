import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { AdminRepository } from "@/lib/repositories/admin.repository";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function stripeTopUpNote(sessionId: string) {
  return `Stripe checkout ${sessionId}`;
}

async function creditCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return { credited: false as const, reason: "unpaid" as const };
  }

  const userId = session.metadata?.userId;
  const amountUsd = Number(session.metadata?.amountUsd);

  if (!userId || !Number.isFinite(amountUsd) || amountUsd <= 0) {
    return { credited: false as const, reason: "invalid_metadata" as const };
  }

  const db = createAdminClient();
  const repo = new AdminRepository(db);
  const note = stripeTopUpNote(session.id);
  const result = await repo.topUpBalance(userId, amountUsd, note, "stripe");

  if (!result.ok) {
    return { credited: false as const, reason: "topup_failed" as const };
  }

  if (!("duplicate" in result && result.duplicate)) {
    await db.from("audit_logs").insert({
      actor: "stripe",
      action: "billing.topup",
      resource_type: "user",
      resource_id: userId,
      metadata: {
        amountUsd,
        sessionId: session.id,
        paymentIntent: session.payment_intent,
      },
    });
  }

  return {
    credited: true as const,
    duplicate: "duplicate" in result && result.duplicate,
    balanceUsd: result.balanceUsd,
  };
}

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

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    await creditCheckoutSession(session);
  }

  return NextResponse.json({ received: true });
}

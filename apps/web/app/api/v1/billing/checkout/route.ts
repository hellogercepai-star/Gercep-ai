import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeEnabled } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

/** POST /api/v1/billing/checkout — Stripe Checkout for USD credits */
export async function POST(request: NextRequest) {
  if (!isStripeEnabled()) {
    return NextResponse.json(
      { error: "Stripe belum dikonfigurasi. Set STRIPE_SECRET_KEY di Vercel." },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { amountUsd?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const amountUsd = Number(body.amountUsd);
  if (!Number.isFinite(amountUsd) || amountUsd < 1 || amountUsd > 500) {
    return NextResponse.json(
      { error: "Amount must be between $1 and $500" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe unavailable" }, { status: 503 });
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Gercep AI API Credits",
            description: `USD ${amountUsd} gateway balance`,
          },
          unit_amount: Math.round(amountUsd * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user.id,
      amountUsd: String(amountUsd),
    },
    success_url: `${origin}/developers?billing=success`,
    cancel_url: `${origin}/developers?billing=cancel`,
  });

  return NextResponse.json({ url: session.url });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const priceId = process.env.COPPERX_PRO_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!priceId || !appUrl) {
      console.error("Missing CopperX checkout configuration.");
      return NextResponse.json({ error: "Checkout is not configured." }, { status: 500 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
    }

    const response = await fetch("https://api.copperx.io/api/v1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.COPPERX_API_KEY}`,
      },
      body: JSON.stringify({
        priceId,
        successUrl: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${appUrl}`,
        paymentMethods: ["usdc", "usdt"],
        metadata: { userId },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const session = await response.json();

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
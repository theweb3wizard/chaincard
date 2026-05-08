import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { recordUnlock, supabaseAdmin } from "@/lib/supabase";

const SIGNATURE_HEADER_NAMES = ["x-copperx-signature", "x-signature", "x-webhook-signature"];

function verifySignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function POST(req: NextRequest) {
  const secret = process.env.COPPERX_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing CopperX webhook secret.");
    return NextResponse.json({ error: "Webhook receiver not configured." }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = SIGNATURE_HEADER_NAMES
    .map((name) => req.headers.get(name))
    .find((value): value is string => typeof value === "string" && value.length > 0);

  if (!signature || !verifySignature(rawBody, signature, secret)) {
    console.error("Invalid CopperX webhook signature.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    console.error("Failed to parse CopperX webhook payload:", err);
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const eventType = payload.type ?? payload.event ?? payload.event_type;
  const session = payload.data?.object ?? payload.data ?? payload;

  if (!session || typeof session !== "object") {
    console.error("CopperX webhook missing session object.");
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  if (eventType !== "checkout.session.completed" && eventType !== "checkout.completed") {
    return NextResponse.json({ success: true, message: "Event ignored." });
  }

  if (session.status !== "completed") {
    return NextResponse.json({ success: true, message: "Checkout not completed yet." });
  }

  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("CopperX webhook session missing metadata.userId.");
    return NextResponse.json({ error: "Missing user metadata." }, { status: 400 });
  }

  try {
    const { data: authUserData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError) {
      console.error("Failed to fetch auth user for webhook:", authError);
    }

    const profilePayload: Record<string, unknown> = {
      id: userId,
      is_pro: true,
      pro_since: new Date().toISOString(),
    };

    if (authUserData?.user?.email) {
      profilePayload.email = authUserData.user.email;
    }

    const { error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      console.error("Failed to upsert user profile from webhook:", profileError);
      return NextResponse.json({ error: "Failed to update user profile." }, { status: 500 });
    }

    await recordUnlock({
      userId,
      checkoutSessionId: session.id,
      status: session.status,
      amountPaid: session.amount_paid ?? null,
      currency: session.currency ?? null,
      metadata: session,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CopperX webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { recordUnlock, supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const response = await fetch(`https://api.copperx.io/api/v1/checkouts/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${process.env.COPPERX_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const session = await response.json();

    if (session.status !== "completed") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const userId = session.metadata?.userId;
    if (!userId) {
      return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    const { data: authUserData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError) {
      console.error("Failed to fetch auth user:", authError);
    }

    const authUser = authUserData?.user;
    const profilePayload: Record<string, unknown> = {
      id: userId,
      is_pro: true,
      pro_since: new Date().toISOString(),
    };

    if (authUser?.email) {
      profilePayload.email = authUser.email;
    }

    const { error } = await supabaseAdmin
      .from("user_profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (error) {
      console.error("Database update error:", error);
      return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
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
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
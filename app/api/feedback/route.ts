// LOCATION: chaincard/app/api/feedback/route.ts
// ACTION: CREATE NEW FILE
//   1. Inside app/api/, create folder: feedback
//   2. Inside feedback/, create file: route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (message.trim().length > 2000) {
      return NextResponse.json({ error: "Message too long." }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("feedback").insert({
      email: email || null,
      message: message.trim(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[feedback] Supabase error:", error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[feedback] Error:", err);
    return NextResponse.json({ success: true });
  }
}
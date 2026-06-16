/*
  API Route: POST /api/newsletter
  Receives an email address from the footer subscribe form and forwards it
  to the same Google Apps Script webhook used by /api/apply. The Apps Script
  inspects payload.type and writes the row to "Sheet 2" (newsletter tab)
  instead of the main applications sheet.

  Required env var (shared with /api/apply):
    GOOGLE_SHEET_WEBHOOK_URL — the "Deploy as web app" URL from the Apps Script.
*/

import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL ?? "";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const payload = {
      type: "newsletter", // discriminator the Apps Script branches on
      email,
      timestamp: new Date().toISOString(),
    };

    if (!WEBHOOK_URL) {
      console.log("[/api/newsletter] No GOOGLE_SHEET_WEBHOOK_URL set. Payload:", payload);
      return NextResponse.json({
        success: true,
        message: "Subscribed (dev mode — no webhook configured)",
      });
    }

    const sheetRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!sheetRes.ok && sheetRes.status !== 302) {
      const text = await sheetRes.text();
      console.error("[/api/newsletter] Webhook error:", sheetRes.status, text);
      return NextResponse.json(
        { success: false, message: "Failed to subscribe" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    console.error("[/api/newsletter] Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

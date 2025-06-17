// src/app/api/send/route.ts
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDatabase } from "../../lib/mongodb";
import { LinkedAccount } from "../../models/linkedAccount";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { from, to, subject, message } = await req.json();

  // Connect and find the matching linked account
  await connectToDatabase();
  const acct = await LinkedAccount.findOne({
    userId: session.user.id,
    email: from,
  });
  if (!acct) {
    return NextResponse.json({ error: "Invalid from address" }, { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: acct.accessToken,
    refresh_token: acct.refreshToken,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Build raw message with proper From header
  const rawLines = [
    `From: ${from}`,
    `To: ${to}`,
    "Content-Type: text/html; charset=UTF-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    message,
  ];
  const encodedMessage = Buffer.from(rawLines.join("\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

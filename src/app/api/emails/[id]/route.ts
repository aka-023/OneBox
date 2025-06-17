// src/app/api/emails/[id]/route.ts
//fetch email details
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase } from "../../../lib/mongodb";
import { LinkedAccount } from "../../../models/linkedAccount";

type EmailDetail = {
  accountEmail: string;
  subject: string;
  from: string;
  body: string;
};

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Await params as required by Next.js
  const { id: messageId } = await context.params;

  // 1. Verify session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Connect to DB
  await connectToDatabase();
  const accounts = await LinkedAccount.find({ userId: session.user.id });

  // 3. Try each account until message found
  for (const acct of accounts) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      access_token: acct.accessToken,
      refresh_token: acct.refreshToken,
    });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    try {
      const res = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const headers = res.data.payload?.headers || [];
      const subject =
        headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
      const from = headers.find((h) => h.name === "From")?.value || "Unknown";

      // Extract body
      const getBody = (payload: any): string => {
        if (payload.parts) {
          for (const part of payload.parts) {
            if (part.mimeType === "text/html") {
              return Buffer.from(part.body.data, "base64").toString("utf-8");
            }
          }
          for (const part of payload.parts) {
            if (part.mimeType === "text/plain") {
              return `<pre>${Buffer.from(
                part.body.data,
                "base64"
              ).toString("utf-8")}</pre>`;
            }
          }
        }
        if (payload.body?.data) {
          return Buffer.from(payload.body.data, "base64").toString("utf-8");
        }
        return "No content found.";
      };

      const body = getBody(res.data.payload);

      const detail: EmailDetail = { accountEmail: acct.email, subject, from, body };
      return NextResponse.json(detail);
    } catch (e: any) {
      if (e.code === 404) continue;
      console.error("Error fetching message:", e);
    }
  }

  return NextResponse.json(
    { error: "Email not found in any linked account" },
    { status: 404 }
  );
}

// src/app/api/emails/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDatabase } from "../../lib/mongodb";
import { LinkedAccount } from "../../models/linkedAccount";

type EmailSummary = {
  accountEmail: string;
  id: string;
  subject: string;
  snippet: string;
};

export async function GET(req: Request) {
  // 1. Verify session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Read the `account` query param
  const url = new URL(req.url);
  const accountEmail = url.searchParams.get("account");
  if (!accountEmail) {
    return NextResponse.json({ error: "Missing account param" }, { status: 400 });
  }

  // 3. Connect to Mongo and find that one linked account
  await connectToDatabase();
  const acct = await LinkedAccount.findOne({
    userId: session.user.id,
    email: accountEmail,
  });
  if (!acct) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  // 4. Set up OAuth2 with your credentials
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    access_token: acct.accessToken,
    refresh_token: acct.refreshToken,
  });

  // 5. Fetch the message list
  let listRes;
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    listRes = await gmail.users.messages.list({
      userId: "me",
      maxResults: 10,
    });
  } catch (e: any) {
    console.error("Gmail list error:", e);
    return NextResponse.json({ error: e.message || "Gmail error" }, { status: 400 });
  }

  const messages = listRes.data.messages || [];
  const allEmails: EmailSummary[] = await Promise.all(
    messages.map(async (msg) => {
      const det = await google
        .gmail({ version: "v1", auth: oauth2Client })
        .users.messages.get({ userId: "me", id: msg.id! });
      const snippet = det.data.snippet || "";
      const subject =
        det.data.payload?.headers?.find((h) => h.name === "Subject")?.value ||
        "(No Subject)";
      return {
        accountEmail,
        id: msg.id!,
        subject,
        snippet,
      };
    })
  );

  return NextResponse.json(allEmails);
}

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

export async function GET() {
  // 1. Verify session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Connect to MongoDB and load linked accounts
  await connectToDatabase();
  const accounts = await LinkedAccount.find({ userId: session.user.id });

  // 3. For each linked account, fetch latest 10 emails
  const allEmails: EmailSummary[] = [];

  await Promise.all(
    accounts.map(async (acct) => {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: acct.accessToken,
        refresh_token: acct.refreshToken,
      });
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      const listRes = await gmail.users.messages.list({
        userId: "me",
        maxResults: 10,
      });

      const messages = listRes.data.messages || [];
      const details = await Promise.all(
        messages.map(async (msg) => {
          const det = await gmail.users.messages.get({
            userId: "me",
            id: msg.id!,
          });
          const snippet = det.data.snippet || "";
          const subject =
            det.data.payload?.headers?.find((h) => h.name === "Subject")
              ?.value || "(No Subject)";
          return {
            accountEmail: acct.email,
            id: msg.id!,
            subject,
            snippet,
          };
        })
      );

      allEmails.push(...details);
    })
  );

  // 4. Optionally sort by some criteria, e.g. newest first (if date available)
  return NextResponse.json(allEmails);
}

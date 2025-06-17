import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route"
import { OAuth2Client } from "google-auth-library";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = context.params;

  const oauth2Client = new OAuth2Client();
  oauth2Client.setCredentials({
    access_token: session.accessToken as string,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  try {
    const res = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });

    const payload = res.data.payload;
    const headers = payload?.headers || [];

    const subject = headers.find((h) => h.name === "Subject")?.value || "(No Subject)";
    const from = headers.find((h) => h.name === "From")?.value || "Unknown";

    // Extract HTML or plain text body
    const getBody = (payload: any): string => {
      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === "text/html") {
            return Buffer.from(part.body.data, "base64").toString("utf-8");
          }
        }
        for (const part of payload.parts) {
          if (part.mimeType === "text/plain") {
            return `<pre>${Buffer.from(part.body.data, "base64").toString("utf-8")}</pre>`;
          }
        }
      }
      if (payload.body?.data) {
        return Buffer.from(payload.body.data, "base64").toString("utf-8");
      }
      return "No content found.";
    };

    const body = getBody(payload);

    return NextResponse.json({ subject, from, body });
  } catch (error) {
    console.error("Failed to fetch email:", error);
    return NextResponse.json({ error: "Failed to fetch email" }, { status: 500 });
  }
}

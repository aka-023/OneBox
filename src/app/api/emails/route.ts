import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const accessToken = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const res = await gmail.users.messages.list({ userId: "me", maxResults: 10 });
  const messages = res.data.messages || [];

  const fullMessages = await Promise.all(
    messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({ userId: "me", id: msg.id! });
      const subjectHeader = detail.data.payload?.headers?.find(h => h.name === "Subject");
      return {
        id: msg.id,
        snippet: detail.data.snippet,
        subject: subjectHeader?.value || "(No Subject)",
      };
    })
  );

  return NextResponse.json(fullMessages);
}

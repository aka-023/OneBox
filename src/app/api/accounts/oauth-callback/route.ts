// src/app/api/accounts/oauth-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDatabase } from "../../../lib/mongodb";
import { LinkedAccount } from "../../../models/linkedAccount";

export async function GET(req: NextRequest) {
  // 1. Get code from query
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect("/dashboard?error=missing_code");
  }

  // 2. Get your existing NextAuth session to know the user linking
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect("/login");
  }

  // 3. Exchange code for tokens
  const redirectURI = `${process.env.NEXTAUTH_URL}/api/accounts/oauth-callback`;
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectURI
  );
  const { tokens } = await oauth2Client.getToken(code);

  // 4. Decode the ID token to get the Gmail address
  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const email = payload?.email!;
  const accessToken = tokens.access_token!;
  const refreshToken = tokens.refresh_token!;
  const expiresAt = (tokens.expiry_date as number) || Date.now() + 3600e3;

  // 5. Upsert into MongoDB
  await connectToDatabase();
  await LinkedAccount.findOneAndUpdate(
    { userId: session.user.id, email },
    {
      provider: "google",
      accessToken,
      refreshToken,
      expiresAt,
    },
    { upsert: true, new: true }
  );

  // 6. Redirect back to dashboard
  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);
}

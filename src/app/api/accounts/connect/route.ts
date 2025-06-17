// src/app/api/accounts/connect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "../../../lib/mongodb";
import { LinkedAccount } from "../../../models/linkedAccount";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  // 1. Validate session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  const { email, accessToken, refreshToken, expiresAt } = await req.json();
  if (!email || !accessToken || !refreshToken || !expiresAt) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // 3. Connect to DB
  await connectToDatabase();

  // 4. Upsert (avoid duplicates)
  const filter = { userId: session.user.id, email };
  const update = {
    provider: "google",
    accessToken,
    refreshToken,
    expiresAt,
  };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  const linked = await LinkedAccount.findOneAndUpdate(filter, update, options);

  return NextResponse.json(
    { message: "Account linked", account: { id: linked._id, email } },
    { status: 201 }
  );
}

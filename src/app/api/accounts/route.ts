// src/app/api/accounts/route.ts
//fetches the accounts linked to an account
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "../../lib/mongodb";
import { LinkedAccount } from "../../models/linkedAccount";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  // 1. Validate session
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Connect to DB
  await connectToDatabase();

  // 3. Query linked accounts
  const accounts = await LinkedAccount.find({ userId: session.user.id }).select(
    "-accessToken -refreshToken"
  );  
  // we hide tokens in the public response

  return NextResponse.json(accounts, { status: 200 });
}

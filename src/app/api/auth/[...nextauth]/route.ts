// src/app/api/auth/[...nextauth]/route.ts
//maintains oAuth2

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { connectToDatabase } from "../../../lib/mongodb";
import { LinkedAccount } from "../../../models/linkedAccount";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
         if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
         }
        token.userId = user?.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.userId as string;
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account && account.provider === 'google') {
        // On initial Google sign-in, save the connected account
        await connectToDatabase();
        const email = user.email as string;
        const accessToken = account.access_token as string;
        const refreshToken = account.refresh_token as string;
        const expiresAt =
          account.expires_at && typeof account.expires_at === 'number'
            ? account.expires_at * 1000
            : Date.now() + 3600 * 1000;

        // Upsert linked account
        await LinkedAccount.findOneAndUpdate(
          { userId: user.id as string, email },
          { provider: 'google', accessToken, refreshToken, expiresAt },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

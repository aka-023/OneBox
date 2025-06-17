// src/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getServerSession`, etc.
   */
  interface Session extends DefaultSession {
    accessToken?: string;
    // override the `user` property to include `id`
    user: DefaultSession["user"] & {
      id: string;
    };
  }

  /**
   * The `User` object from next-auth callbacks
   */
  interface User extends DefaultUser {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
  }
}

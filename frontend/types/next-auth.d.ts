import NextAuth, { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
    } & DefaultSession["user"];
    accessToken?: string;
    isNewUser?: boolean;
    needsPreferences?: boolean;
    userData?: any;
    backendVerified?: boolean;
  }

  interface JWT {
    token?: string;
    accessToken?: string;
    userId?: string;
    isNewUser?: boolean;
    needsPreferences?: boolean;
    user?: any;
    backendVerified?: boolean;
  }
}

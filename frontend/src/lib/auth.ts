import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { userService } from "@/lib/user-service";

const USER_SERVICE_TOKEN_MAX_AGE_SECONDS = 6 * 60 * 60;

function getJwtExpiryMs(token: string): number | null {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    ) as { exp?: number };
    if (typeof payload.exp === "number") {
      return payload.exp * 1000;
    }
  } catch {
    // ignore
  }
  return null;
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  providers: [
    GoogleProvider({
      clientId: process.env['GOOGLE_CLIENT_ID']!,
      clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: USER_SERVICE_TOKEN_MAX_AGE_SECONDS,
  },
  jwt: {
    maxAge: USER_SERVICE_TOKEN_MAX_AGE_SECONDS,
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        const userData = await userService.createUser({
          email: user.email,
          name: user.name || user.email.split('@')[0] || 'User',
        });
        user.id = userData.user.id;
        return true;
      } catch {
        return true;
      }
    },

    async jwt({ token, user, account, trigger, session }) {
      const accessTokenExpires = token["accessTokenExpires"] as number | undefined;
      if (!account && !user && accessTokenExpires && Date.now() >= accessTokenExpires) {
        token["error"] = "TokenExpired";
        token["backendVerified"] = false;
        token["token"] = undefined;
        token["accessToken"] = undefined;
        return token;
      }

      if (trigger === "update" && session) {
        if (session.isNewUser !== undefined) token['isNewUser'] = session.isNewUser;
        if (session.needsPreferences !== undefined) token['needsPreferences'] = session.needsPreferences;
        return token;
      }

      if (account && user) {
        try {
          const userData = await userService.createUser({
            email: user.email!,
            name: user.name || user.email!.split('@')[0] || 'User',
          });
          token['accessToken'] = userData.token;
          token['token'] = userData.token;
          token['accessTokenExpires'] = getJwtExpiryMs(userData.token);
          token['userId'] = userData.user.id;
          token['isNewUser'] = userData.isNewUser;
          token['needsPreferences'] = userData.needsPreferences;
          token['user'] = userData.user;
          token['backendVerified'] = true;
          token['error'] = undefined;
        } catch {
          token['backendVerified'] = false;
        }
      } else if (token.email && !token['backendVerified']) {
        try {
          const userData = await userService.createUser({
            email: token.email as string,
            name: (token.name as string) || (token.email as string).split('@')[0] || 'User',
          });
          token['accessToken'] = userData.token;
          token['token'] = userData.token;
          token['accessTokenExpires'] = getJwtExpiryMs(userData.token);
          token['userId'] = userData.user.id;
          token['isNewUser'] = userData.isNewUser;
          token['needsPreferences'] = userData.needsPreferences;
          token['user'] = userData.user;
          token['backendVerified'] = true;
          token['error'] = undefined;
        } catch {
          token['backendVerified'] = false;
        }
      }

      if (user) {
        token['id'] = user.id;
        token['email'] = user.email || null;
        token['name'] = user.name || null;
      }

      return token;
    },

    async session({ session, token }) {
      const accessTokenExpires = token["accessTokenExpires"] as number | undefined;
      if (token["error"] === "TokenExpired" || (accessTokenExpires && Date.now() >= accessTokenExpires)) {
        session.backendVerified = false as boolean;
        delete session.accessToken;
        session.error = "TokenExpired";
        return session;
      }

      if (!token['backendVerified']) {
        session.backendVerified = false as boolean;
        return session;
      }

      session.accessToken = token['token'] as string;
      session.user.id = token['userId'] as string;
      session.user.email = token['email'] as string;
      session.user.name = token['name'] as string;
      session.isNewUser = token['isNewUser'] as boolean;
      session.needsPreferences = token['needsPreferences'] as boolean;
      session.userData = token['user'] as any;
      session.backendVerified = token['backendVerified'] as boolean;

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/login`;
    },
  },
  pages: {
    signIn: "/sign-up",
    error: "/sign-up",
  },
  events: {
    async signIn() {},
    async signOut() {},
  },
  debug: false,
};

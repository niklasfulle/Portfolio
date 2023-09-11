import { NextAuthOptions } from "next-auth"
import { db } from "@/lib/db/prisma"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GitHubProvider from 'next-auth/providers/github'
import { cookies } from "next/headers"
import { decode } from "next-auth/jwt"
import { getGithubCredentials } from "@/lib/auth/get-credentials"


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    GitHubProvider({
      clientId: getGithubCredentials().githubClientId,
      clientSecret: getGithubCredentials().githubClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user }) {

      const { email } = user as any;

      const dbUser = await db.user.findUnique({
        where: {
          email,
        },
      });

      const accountDb = await db.account.findFirst({
        where: {
          userId: dbUser?.id,
        },
      });

      if (accountDb?.provider == "credentials" && email == dbUser?.email) {
        return false
      }

      return true;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
    session: async ({ session }) => {
      session.user = {
        ...session.user
      };
      return Promise.resolve(session);
    },
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
    encode: async () => {

      const cookie = cookies().get("next-auth.session-token");

      if (cookie) return cookie.value;
      return "";

    },
    decode: async (arg) => {
      return decode(arg);
    },
  },
  events: {
    async signOut({ session }) {
      const { sessionToken = "" } = session as unknown as {
        sessionToken?: string;
      };

      if (sessionToken) {
        await db.session.deleteMany({
          where: {
            sessionToken: sessionToken,
          },
        });
      }
    },
  },
}
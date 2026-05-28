import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    {
      id: "yahoo",
      name: "Yahoo",
      type: "oidc",
      wellKnown: "https://api.login.yahoo.com/.well-known/openid-configuration",
      issuer: "https://api.login.yahoo.com",
      clientId: process.env.AUTH_YAHOO_ID,
      clientSecret: process.env.AUTH_YAHOO_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "USER",
        };
      },
      allowDangerousEmailAccountLinking: true,
    },
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return user;
      }
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      // 1. Credentials flow: Block if not verified
      if (account?.provider === "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email as string },
          select: { emailVerified: true }
        });

        if (!dbUser?.emailVerified) {
          // Returning false or throwing will redirect to the error page
          throw new Error("EmailNotVerified");
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;

        // Fetch latest verification status directly from DB to bypass JWT caching
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { emailVerified: true }
        });
        session.user.emailVerified = dbUser?.emailVerified || null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user, isNewUser, account }) {
      if (isNewUser && user.email) {
        console.log(`[auth] New user signed in: ${user.email}. Triggering smart tracking.`);
        
        // Force verification for OAuth users by clearing the auto-set emailVerified field on first login
        if (account?.provider !== "credentials") {
          await prisma.user.update({
            where: { email: user.email },
            data: { emailVerified: null }
          });
          console.log(`[auth] Cleared emailVerified for new OAuth user: ${user.email}`);
        }
      }
    }
  }
});

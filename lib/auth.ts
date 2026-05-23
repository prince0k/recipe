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
      type: "oauth",
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

      // 2. OAuth flow (Google/Yahoo): Auto-verify if needed
      if (account?.provider !== "credentials" && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { emailVerified: true }
        });

        if (!dbUser?.emailVerified) {
          await prisma.user.update({
            where: { email: user.email },
            data: { emailVerified: new Date() }
          });
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
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.email) {
        console.log(`[auth] New user signed in: ${user.email}. Triggering smart tracking.`);
      }
    }
  }
});

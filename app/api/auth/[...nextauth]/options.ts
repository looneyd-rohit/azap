import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { randomBytes, randomUUID } from "crypto";
import { Adapter } from "next-auth/adapters";

const prisma = new PrismaClient();

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    generateSessionToken: () => {
      return randomUUID?.() ?? randomBytes(32).toString("hex");
    },
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      profile: async (user) => {
        // console.log("Github User: ", user);
        return {
          id: user.login ?? user.id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatar_url,
        };
      },
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
      profile: async (user) => {
        // console.log("Google User: ", user);
        return {
          id: user.sub.toString(),
          name: user.name,
          email: user.email,
          image: user.picture,
        };
      },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, account, profile, isNewUser }) {
      // console.log("jwt: ", token);
      // console.log("jwt user: ", user);
      if (user?.id) {
        token.id = user.id;
      }
      if (user?.email) {
        token.email = user.email;
      }
      if (user?.name) {
        token.name = user.name;
      }
      if (user?.image) {
        token.image = user.image;
        token.picture = user.image;
      }
      // if (user?.role) {
      //   token.role = user.role;
      // }
      if (trigger === "update" && session?.image) {
        // console.log("updating image and saving to db...");
        const res = await prisma.user.update({
          where: { id: token.id as string },
          data: { image: session.image },
        });
        // console.log("updated: ", res);
        token.image = session.image;
        token.picture = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      // console.log("session: ", session);
      // console.log("session token: ", token);
      if (token?.id) {
        session.id = token.id;
      }
      if (token?.email) {
        session.email = token.email;
      }
      if (token?.name) {
        session.name = token.name;
      }
      if (token?.image) {
        session.image = token.image;
        session.picture = token.picture;
      }
      // if (token?.role) {
      //   session.role = token.role;
      // }
      return session;
    },
  },
};

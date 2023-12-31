import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { randomBytes, randomUUID } from "crypto";
import { Adapter } from "next-auth/adapters";

const prisma = new PrismaClient();

export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    generateSessionToken: () => {
      return randomUUID?.() ?? randomBytes(32).toString("hex");
    },
  },
  providers: [
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: process.env.EMAIL_SERVER_PORT,
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD
    //     }
    //   },
    //   from: process.env.EMAIL_FROM
    // }),
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      profile: async (user) => {
        console.log("Github User: ", user);
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
        console.log("Google User: ", user);
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
    async jwt({ token, user, trigger, session, account, profile }) {
      // console.log("jwt: ", token);
      // console.log("jwt user: ", user);
      if (user) {
        token.id = user.id;
      }
      if (user?.email) {
        token.email = user.email;
      }
      if (user?.name) {
        token.name = user.name;
      }
      if (user?.image) {
        token.picture = user.image;
      }
      // if (user?.role) {
      //   token.role = user.role;
      // }
      if (trigger === "update" && session?.image) {
        token.picture = session.image;
        console.log("updating image and saving to db...");
        console.log("updating part session: ", session);
        const res = await prisma.user.update({
          where: { id: token.id as string },
          data: { image: session.image },
        });
        // console.log("updated: ", res);
      }
      return token;
    },
    async session({ session, token }) {
      console.log("session: ", session);
      // console.log("session token: ", token);
      if (token?.id) {
        session.user.id = token.id;
      }
      if (token?.email) {
        session.user.email = token.email;
      }
      if (token?.name) {
        session.user.name = token.name;
      }
      if (token?.picture) {
        session.user.image = token.picture;
      }
      // if (token?.role) {
      //   session.role = token.role;
      // }
      return session;
    },
  },
};

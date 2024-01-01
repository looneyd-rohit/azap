import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { randomBytes, randomUUID } from "crypto";
import { Adapter } from "next-auth/adapters";
import { sendVerificationRequest } from "@/lib/nodemailer";

const prisma = new PrismaClient();

export const options: NextAuthOptions = {
  pages: {
    signIn: "/signin",
    verifyRequest: "/verify",
    error: "/error",
    signOut: "/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 7 * 24 * 60 * 60,
    generateSessionToken: () => {
      return randomUUID?.() ?? randomBytes(32).toString("hex");
    },
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
      normalizeIdentifier(identifier: string): string {
        console.log("normalizeIdentifier: ", identifier);
        // Get the first two elements only,
        // separated by `@` from user input.
        let [local, domain] = identifier.toLowerCase().trim().split("@");
        // The part before "@" can contain a ","
        // but we remove it on the domain part
        domain = domain.split(",")[0];
        return `${local}@${domain}`;
      },
      async generateVerificationToken() {
        return randomUUID?.() ?? randomBytes(32).toString("hex");
      },
    }),
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
    // async signIn({ user, account, email }) {
    //   await prisma.$connect();
    //   const userExists = await prisma.user.findFirst({
    //     where: { email: user.email },
    //   });
    //   if (userExists) {
    //     // if user exists already in db (thru some other provider)
    //     // then send them direct signIn link
    //     return true;
    //   } else {
    //     // else force them to register
    //     // return "/register";
    //     return false
    //   }
    // },
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
        // console.log("updating image and saving to db...");
        // console.log("updating part session: ", session);
        const res = await prisma.user.update({
          where: { id: token.id as string },
          data: { image: session.image },
        });
        // console.log("updated: ", res);
      }
      return token;
    },
    async session({ session, token }) {
      // console.log("session: ", session);
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

import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "OWNER" | "ADMIN" | "USER";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "OWNER" | "ADMIN" | "USER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "OWNER" | "ADMIN" | "USER";
  }
}

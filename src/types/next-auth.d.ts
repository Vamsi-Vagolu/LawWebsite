import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // change id to string
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string; // change id to string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string; // include id in JWT
  }
}

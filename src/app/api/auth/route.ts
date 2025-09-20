import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60,   // refresh JWT every 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Store user info in the token on login
      if (user) {
        token.id = user.id;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      // Persist JWT info in session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: false, // set true for debugging auth issues
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

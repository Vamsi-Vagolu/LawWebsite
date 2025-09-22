// /app/api/auth/[...nextauth]/route.ts
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

        // ✅ Include 'role' in select
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true, // ✅ include role
          },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
          role: user.role, // ✅ role included
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Store user info in the token on login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      // Persist JWT info in session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "OWNER" | "ADMIN" | "USER";
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | null;
      }
      return session;
    },
    // ✅ Add redirect callback to control where users go after login
    async redirect({ url, baseUrl }) {
      // If the URL is relative, make it absolute
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If the URL is the baseUrl + dashboard, redirect to home
      if (url === `${baseUrl}/dashboard`) return baseUrl;
      // If the URL is trying to go to dashboard, redirect to home
      if (url.includes("/dashboard")) return baseUrl;
      // Otherwise, if it's the same origin, allow it
      if (new URL(url).origin === baseUrl) return url;
      // Default to home page
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login", // ✅ Fixed: Change from "/auth/signin" to "/login"
  },
  debug: false,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

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
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
          },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "OWNER" | "ADMIN" | "USER";
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | null;
      }
      return session;
    },
    // ✅ Smart redirect callback - respects the original destination
    async redirect({ url, baseUrl }) {
      console.log("Redirect attempt:", url); // Debug log
      
      // ✅ Handle dashboard redirects (convert to home)
      if (url.includes("/dashboard")) {
        console.log("Dashboard redirect intercepted, going to home");
        return baseUrl;
      }
      
      // ✅ Allow valid app routes to redirect properly
      const validRoutes = ["/", "/notes", "/blog", "/contact", "/admin", "/owner"];
      
      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        // Check if it's a valid route in our app
        const pathname = url.split("?")[0]; // Remove query params
        if (validRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
          console.log(`Redirecting to valid route: ${fullUrl}`);
          return fullUrl;
        }
        // Default to home for invalid routes
        return baseUrl;
      }
      
      // If same origin and valid, allow it
      if (new URL(url).origin === baseUrl) {
        const pathname = new URL(url).pathname;
        if (validRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
          console.log(`Allowing same-origin valid redirect: ${url}`);
          return url;
        }
      }
      
      // Default to home for safety
      console.log("Defaulting to home page");
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: false,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

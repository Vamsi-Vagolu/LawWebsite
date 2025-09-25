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
        console.log("🔐 Authorize attempt for:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

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

        if (!user || !user.password) {
          console.log("❌ User not found or no password");
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.log("❌ Invalid password");
          return null;
        }

        console.log("✅ Authentication successful for user:", user.id);

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
      console.log("🎫 JWT callback - user present:", !!user, "token.sub:", token.sub);
      
      if (user) {
        // ✅ CRITICAL: Use token.sub consistently (this is what getToken() uses)
        token.sub = user.id;  // This is the most important line!
        token.role = user.role;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
        
        console.log("✅ JWT token updated with user ID:", user.id);
        return token; // Return token to avoid invalidation
      }

      // ✅ Verify user still exists in database (important for security)
      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          });

          if (!dbUser) {
            console.log("❌ User no longer exists in database, invalidating token");
            // Return a minimal token that will cause session invalidation
            return { ...token, sub: undefined };
          }

          // Update token with current user data
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.email = dbUser.email;
          
          console.log("✅ User verified in database:", dbUser.id);
        } catch (error) {
          console.error("❌ Error verifying user in JWT callback:", error);
          // Don't invalidate on database error, just continue
        }
      }

      return token;
    },
    
    async session({ session, token }) {
      console.log("📋 Session callback - token.sub:", token.sub);
      
      if (session.user && token.sub) {
        // ✅ Use token.sub (not token.id) to match what's used in getToken()
        session.user.id = token.sub;
        session.user.role = token.role as "OWNER" | "ADMIN" | "USER";
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | null;
        
        console.log("✅ Session updated with user ID:", token.sub);
      }

      return session;
    },
    
    // ✅ Smart redirect callback - respects the original destination
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect attempt:", url);
      
      // ✅ Handle dashboard redirects (convert to home)
      if (url.includes("/dashboard")) {
        console.log("Dashboard redirect intercepted, going to home");
        return baseUrl;
      }
      
      // ✅ Allow valid app routes to redirect properly
      const validRoutes = ["/", "/notes", "/blog", "/contact", "/admin", "/owner", "/tests"];
      
      // If it's a relative URL, make it absolute
      if (url.startsWith("/")) {
        const fullUrl = `${baseUrl}${url}`;
        const pathname = url.split("?")[0]; // Remove query params
        if (validRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
          console.log(`✅ Redirecting to valid route: ${fullUrl}`);
          return fullUrl;
        }
        // Default to home for invalid routes
        console.log("❌ Invalid route, defaulting to home");
        return baseUrl;
      }
      
      // If same origin and valid, allow it
      if (url.startsWith(baseUrl)) {
        const pathname = new URL(url).pathname;
        if (validRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
          console.log(`✅ Allowing same-origin valid redirect: ${url}`);
          return url;
        }
      }
      
      // Default to home for safety
      console.log("🏠 Defaulting to home page");
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

export default function SessionProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      // keeps session in memory + re-fetch from server after refresh
      refetchInterval={60 * 5} // refresh every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}

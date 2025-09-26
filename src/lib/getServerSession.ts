// lib/getServerSession.ts
import { getServerSession as getNextAuthSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const getServerSession = async () => {
  return await getNextAuthSession(authOptions);
};

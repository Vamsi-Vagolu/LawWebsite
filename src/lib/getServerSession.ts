// lib/getServerSession.ts
import { getServerSession as getNextAuthSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const getServerSession = async () => {
  return await getNextAuthSession(authOptions);
};

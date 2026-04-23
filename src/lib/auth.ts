import "server-only";
import { cache } from "react";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");
  return user;
}

export async function isAdminUser(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes((user.email ?? "").toLowerCase());
}

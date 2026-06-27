"use client";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "";

export async function requestPasswordReset(email: string, redirectTo: string) {
  const res = await fetch(`${BASE}/api/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, redirectTo }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await fetch(`${BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) throw new Error(await res.text());
}

"use server";

import { waitlistInputSchema } from "./schema";
import { waitlistStorage } from "./storage";
import type { WaitlistStorage } from "./storage";

// action은 WaitlistStorage 인터페이스 타입에만 의존 — Supabase 교체 시 action 무변경
const storage: WaitlistStorage = waitlistStorage;

export async function joinWaitlist(
  email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const result = waitlistInputSchema.safeParse({ email });

  if (!result.success) {
    return {
      ok: false,
      error: result.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.",
    };
  }

  try {
    await storage.add(email.toLowerCase().trim());
    return { ok: true };
  } catch {
    return { ok: false, error: "잠시 후 다시 시도해주세요." };
  }
}

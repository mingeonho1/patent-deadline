import { supabase } from "@/lib/db";

export interface WaitlistStorage {
  add(email: string): Promise<void>;
  list(): Promise<string[]>;
}

class SupabaseWaitlistStorage implements WaitlistStorage {
  async add(email: string): Promise<void> {
    const { error } = await supabase.from("waitlist").insert({ email });

    // 23505: unique_violation — 동일 이메일 재등록은 멱등 처리
    if (error && error.code !== "23505") {
      throw error;
    }
  }

  async list(): Promise<string[]> {
    const { data, error } = await supabase.from("waitlist").select("email");

    if (error) throw error;
    return (data ?? []).map((row) => row.email as string);
  }
}

export const waitlistStorage: WaitlistStorage = new SupabaseWaitlistStorage();

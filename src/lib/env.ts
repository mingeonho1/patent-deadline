import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z
    .string()
    .url({ message: "SUPABASE_URL은 유효한 URL이어야 합니다." }),
  SUPABASE_SECRET_KEY: z
    .string()
    .min(1, { message: "SUPABASE_SECRET_KEY가 설정되어 있지 않습니다." }),
});

export const env = envSchema.parse(process.env);

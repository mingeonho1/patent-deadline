import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z
    .string()
    .url({ message: "SUPABASE_URL은 유효한 URL이어야 합니다." }),
  SUPABASE_SECRET_KEY: z
    .string()
    .min(1, { message: "SUPABASE_SECRET_KEY가 설정되어 있지 않습니다." }),
  SITE_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);

// SITE_URL env > Vercel 자동 주입 URL > 로컬 기본값 순으로 fallback.
// metadataBase 등 절대 URL이 필요한 곳에서 사용한다.
export function siteUrl(): string {
  if (env.SITE_URL) return env.SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

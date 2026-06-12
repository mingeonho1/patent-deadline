import { z } from "zod";

export const waitlistInputSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 주소를 입력해주세요." }),
});

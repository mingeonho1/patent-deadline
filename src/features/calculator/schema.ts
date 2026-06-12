import { z } from "zod";

export const calculatorInputSchema = z
  .object({
    sentDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)",
      })
      .refine(
        (s) => {
          const d = new Date(s + "T12:00:00Z");
          return !isNaN(d.getTime());
        },
        { message: "유효하지 않은 날짜입니다" },
      )
      .refine(
        (s) => {
          const d = new Date(s + "T12:00:00Z");
          const now = new Date();
          // 1900년 미만 또는 현재+10년 초과는 거부
          return (
            d.getUTCFullYear() >= 1900 &&
            d.getUTCFullYear() <= now.getUTCFullYear() + 10
          );
        },
        { message: "발송일은 1900년~현재+10년 범위여야 합니다" },
      ),

    baseMonthsType: z.enum(["4", "2", "custom"] as const, {
      error: () => "기본기간을 선택해주세요",
    }),

    customMonths: z
      .number()
      .int({ message: "직접 입력은 1~12 사이의 정수여야 합니다" })
      .min(1, { message: "직접 입력은 1~12 사이의 정수여야 합니다" })
      .max(12, { message: "직접 입력은 1~12 사이의 정수여야 합니다" })
      .optional(),
  })
  .refine(
    (v) => v.baseMonthsType !== "custom" || v.customMonths !== undefined,
    { message: "직접 입력 시 개월 수를 입력해주세요", path: ["customMonths"] },
  );

export type CalculatorInput = z.infer<typeof calculatorInputSchema>;
export type BaseMonthsType = CalculatorInput["baseMonthsType"];

// 파생 헬퍼: 실제 baseMonths 숫자 추출
export function resolveBaseMonths(input: CalculatorInput): number {
  if (input.baseMonthsType === "4") return 4;
  if (input.baseMonthsType === "2") return 2;
  return input.customMonths!;
}

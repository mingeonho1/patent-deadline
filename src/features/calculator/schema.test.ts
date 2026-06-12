import { describe, it, expect } from "vitest";
import { calculatorInputSchema } from "@/features/calculator/schema";

describe("calculatorInputSchema", () => {
  it("S1: 유효한 입력이 parse에 성공한다", () => {
    const result = calculatorInputSchema.safeParse({
      sentDate: "2026-03-10",
      baseMonthsType: "4",
    });
    expect(result.success).toBe(true);
  });

  it("S2: customMonths가 정수가 아니면 parse에 실패한다", () => {
    const result = calculatorInputSchema.safeParse({
      sentDate: "2026-03-10",
      baseMonthsType: "custom",
      customMonths: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it("S3: 현재+10년을 초과하는 날짜(2090년)는 parse에 실패하고 한국어 에러 메시지를 반환한다", () => {
    const result = calculatorInputSchema.safeParse({
      sentDate: "2090-01-01",
      baseMonthsType: "4",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const messages = result.error.issues.map((i) => i.message).join(" ");
    expect(messages).toContain("발송일은 1900년~현재+10년");
  });

  it("S4: baseMonthsType이 custom인데 customMonths가 없으면 parse에 실패한다", () => {
    const result = calculatorInputSchema.safeParse({
      sentDate: "2026-03-10",
      baseMonthsType: "custom",
    });
    expect(result.success).toBe(false);
  });

  it("S5: customMonths가 0이면 parse에 실패하고 한국어 에러 메시지를 반환한다", () => {
    const result = calculatorInputSchema.safeParse({
      sentDate: "2026-03-10",
      baseMonthsType: "custom",
      customMonths: 0,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const msg = result.error.issues[0]?.message ?? "";
    expect(msg).toContain("직접 입력은 1~12");
  });

  it("S6: customMonths가 소수이면 parse에 실패하고 한국어 에러 메시지를 반환한다", () => {
    const result = calculatorInputSchema.safeParse({
      sentDate: "2026-03-10",
      baseMonthsType: "custom",
      customMonths: 1.5,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const msg = result.error.issues[0]?.message ?? "";
    expect(msg).toContain("직접 입력은 1~12");
  });
});

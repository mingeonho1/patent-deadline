import { describe, it, expect } from "vitest";
import { calculateExtensionFee } from "@/features/calculator/fee";

describe("calculateExtensionFee", () => {
  it("T14: 0개월 → 0원", () => {
    expect(calculateExtensionFee(0)).toBe(0);
  });

  it("T9: 1개월 → 20,000원", () => {
    expect(calculateExtensionFee(1)).toBe(20_000);
  });

  it("T10: 2개월 → 50,000원", () => {
    expect(calculateExtensionFee(2)).toBe(50_000);
  });

  it("3개월 → 110,000원", () => {
    expect(calculateExtensionFee(3)).toBe(110_000);
  });

  it("T11: 4개월 → 230,000원", () => {
    expect(calculateExtensionFee(4)).toBe(230_000);
  });

  it("T12: 5개월 → 470,000원", () => {
    expect(calculateExtensionFee(5)).toBe(470_000);
  });

  it("T13: 6개월 → 710,000원", () => {
    expect(calculateExtensionFee(6)).toBe(710_000);
  });
});

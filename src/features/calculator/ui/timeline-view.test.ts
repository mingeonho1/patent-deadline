import { describe, it, expect } from "vitest";
import { calculateDday } from "@/features/calculator/ui/timeline-view";

const d = (y: number, m: number, day: number) =>
  new Date(Date.UTC(y, m - 1, day, 12, 0, 0));

describe("calculateDday", () => {
  it("기한일이 오늘이면 D-0을 반환한다", () => {
    // UTC 03:00 = KST 12:00 → 같은 날
    const today = new Date(Date.UTC(2026, 5, 12, 3, 0, 0));
    const deadline = d(2026, 6, 12);
    expect(calculateDday(deadline, today)).toBe("D-0");
  });

  it("3일 후면 D-3을 반환한다", () => {
    const today = new Date(Date.UTC(2026, 5, 12, 3, 0, 0)); // KST 12:00
    const deadline = d(2026, 6, 15);
    expect(calculateDday(deadline, today)).toBe("D-3");
  });

  it("5일 전이면 D+5를 반환한다", () => {
    const today = new Date(Date.UTC(2026, 5, 12, 3, 0, 0)); // KST 12:00
    const deadline = d(2026, 6, 7);
    expect(calculateDday(deadline, today)).toBe("D+5");
  });

  it("KST 자정 직후 (UTC 15:30 전날)에도 오늘을 올바르게 계산한다", () => {
    // KST 2026-07-10 00:30 = UTC 2026-07-09 15:30
    const nowUtc = new Date(Date.UTC(2026, 6, 9, 15, 30, 0));
    const deadline = d(2026, 7, 10);
    // KST 기준 오늘은 7/10이므로 D-0
    expect(calculateDday(deadline, nowUtc)).toBe("D-0");
  });

  it("기한일이 내일이면 D-1을 반환한다", () => {
    const today = new Date(Date.UTC(2026, 6, 9, 3, 0, 0)); // KST 7월 9일 12:00
    const deadline = d(2026, 7, 10);
    expect(calculateDday(deadline, today)).toBe("D-1");
  });

  it("기한일이 지났으면 D+N을 반환한다", () => {
    const today = new Date(Date.UTC(2026, 6, 15, 3, 0, 0)); // KST 7월 15일 12:00
    const deadline = d(2026, 7, 10);
    expect(calculateDday(deadline, today)).toBe("D+5");
  });
});

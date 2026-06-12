import { describe, it, expect } from "vitest";
import { buildTimeline } from "@/features/calculator/timeline";

const d = (y: number, m: number, day: number) =>
  new Date(Date.UTC(y, m - 1, day, 12, 0, 0));

describe("buildTimeline", () => {
  const sentDate = d(2026, 3, 10);
  const baseMonths = 4;
  const timeline = buildTimeline(sentDate, baseMonths);

  it("정확히 7개 항목을 반환한다", () => {
    expect(timeline).toHaveLength(7);
  });

  it("첫 항목(연장 0개월)의 기한·순연·수수료·소명여부가 올바르다", () => {
    expect(timeline).toHaveLength(7);
    const first = timeline[0];
    if (first === undefined) throw new Error("timeline[0]이 없습니다");
    expect(first.extensionMonths).toBe(0);
    expect(first.deadline).toEqual(d(2026, 7, 10));
    expect(first.originalDeadline).toEqual(d(2026, 7, 10));
    expect(first.deferred).toBe(false);
    expect(first.cumulativeFee).toBe(0);
    expect(first.needsJustification).toBe(false);
  });

  it("연장 5개월 항목은 소명 필요(needsJustification=true)이다", () => {
    // EXTENSION_RANGE = [0,1,2,3,4,5,6] 순서 고정이므로 index 5 = extensionMonths=5
    const entry = timeline[5];
    if (entry === undefined) throw new Error("timeline[5]이 없습니다");
    expect(entry.extensionMonths).toBe(5);
    expect(entry.needsJustification).toBe(true);
  });

  it("연장 6개월 항목의 누적 수수료는 710000원이다", () => {
    const entry = timeline[6];
    if (entry === undefined) throw new Error("timeline[6]이 없습니다");
    expect(entry.extensionMonths).toBe(6);
    expect(entry.cumulativeFee).toBe(710_000);
  });
});

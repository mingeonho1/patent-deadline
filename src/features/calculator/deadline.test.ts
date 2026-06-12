import { describe, it, expect } from "vitest";
import {
  calculateDeadline,
  adjustForHolidays,
} from "@/features/calculator/deadline";

// UTC noon 고정 날짜 생성 헬퍼
const d = (y: number, m: number, day: number) =>
  new Date(Date.UTC(y, m - 1, day, 12, 0, 0));

describe("calculateDeadline", () => {
  it("T1: 기본 케이스 — 발송일 3/10, 4개월 → 7/10", () => {
    expect(calculateDeadline(d(2026, 3, 10), 4)).toEqual(d(2026, 7, 10));
  });

  it("T2: 해당일 없음 → 월말 — 발송일 1/30, 1개월 → 2/28", () => {
    expect(calculateDeadline(d(2026, 1, 30), 1)).toEqual(d(2026, 2, 28));
  });

  it("T3: 평년 2월 말일 — 발송일 1/30, 1개월 → 2027-02-28", () => {
    expect(calculateDeadline(d(2027, 1, 30), 1)).toEqual(d(2027, 2, 28));
  });

  it("T4: 월말 발송 + 해당일 없음 — 발송일 10/31, 4개월 → 2027-02-28", () => {
    expect(calculateDeadline(d(2026, 10, 31), 4)).toEqual(d(2027, 2, 28));
  });

  it("T5: 31일 → 30일 월 — 발송일 8/31, 1개월 → 9/30", () => {
    expect(calculateDeadline(d(2026, 8, 31), 1)).toEqual(d(2026, 9, 30));
  });

  it("월초 발송 — 발송일 1/1, 4개월 → 5/1", () => {
    expect(calculateDeadline(d(2026, 1, 1), 4)).toEqual(d(2026, 5, 1));
  });

  it("연말 발송 — 발송일 12/15, 2개월 → 다음해 2/15", () => {
    expect(calculateDeadline(d(2026, 12, 15), 2)).toEqual(d(2027, 2, 15));
  });

  it("회귀: 발송일 4/30 +1개월 → 5/31 (기산일 5/1의 전일)", () => {
    expect(calculateDeadline(d(2026, 4, 30), 1)).toEqual(d(2026, 5, 31));
  });
  it("회귀: 발송일 2/28 +1개월 → 3/31", () => {
    expect(calculateDeadline(d(2026, 2, 28), 1)).toEqual(d(2026, 3, 31));
  });
  it("회귀: 발송일 6/30 +4개월 → 10/31", () => {
    expect(calculateDeadline(d(2026, 6, 30), 4)).toEqual(d(2026, 10, 31));
  });
});

describe("adjustForHolidays", () => {
  it("T6: 토요일 → 다음 월요일로 순연", () => {
    // 2026-05-02 토요일
    const result = adjustForHolidays(d(2026, 5, 2));
    expect(result.final).toEqual(d(2026, 5, 4));
    expect(result.deferred).toBe(true);
  });

  it("T7: 2026-10-03 개천절(토) → 2026-10-06 (04 일, 05 개천절 대체 건너뜀)", () => {
    const result = adjustForHolidays(d(2026, 10, 3));
    expect(result.final).toEqual(d(2026, 10, 6));
    expect(result.deferred).toBe(true);
    expect(result.original).toEqual(d(2026, 10, 3));
  });

  it("T8: 2026-05-01 근로자의날(금) → 2026-05-04 월요일", () => {
    const result = adjustForHolidays(d(2026, 5, 1));
    expect(result.final).toEqual(d(2026, 5, 4));
    expect(result.deferred).toBe(true);
  });

  it("평일은 순연 없음", () => {
    // 2026-03-10 화요일, 공휴일 아님
    const result = adjustForHolidays(d(2026, 3, 10));
    expect(result.final).toEqual(d(2026, 3, 10));
    expect(result.deferred).toBe(false);
  });

  it("일요일 → 다음 월요일로 순연", () => {
    // 2026-03-01 삼일절(일요일) → 2026-03-02 대체공휴일 → 2026-03-03 화요일
    const result = adjustForHolidays(d(2026, 3, 1));
    expect(result.final).toEqual(d(2026, 3, 3));
    expect(result.deferred).toBe(true);
  });

  it("original과 final이 각각 올바르게 반환된다", () => {
    const input = d(2026, 5, 2); // 토요일
    const result = adjustForHolidays(input);
    expect(result.original).toEqual(input);
  });

  it("2027-10-09 토요일 → 대체공휴일 건너뜀 → 2027-10-12 화요일", () => {
    // 10-09(토), 10-10(일), 10-11(대체공휴일, 월) 연속 → 10-12(화)
    const result = adjustForHolidays(d(2027, 10, 9));
    expect(result.final).toEqual(d(2027, 10, 12));
    expect(result.deferred).toBe(true);
  });
});

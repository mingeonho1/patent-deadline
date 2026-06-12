import { isNonWorkingDay } from "@/features/calculator/holidays";

/**
 * 의견제출통지서 발송일로부터 기본기한을 계산한다.
 * 초일불산입: 기산일 = 발송일 + 1일
 * 역에 따른 전일 만료: 만료일 = 최후의 월에서 (기산일.day - 1)번째 날
 * 기산일이 1일이면 최후의 월의 전달 말일이 만료일.
 * 공휴일 순연은 이 함수가 담당하지 않는다 (adjustForHolidays 담당).
 */
export function calculateDeadline(sentDate: Date, months: number): Date {
  const sentY = sentDate.getUTCFullYear();
  const sentM = sentDate.getUTCMonth();
  const sentD = sentDate.getUTCDate();

  // 초일불산입: 기산일 = 발송일 + 1일
  const startDate = new Date(Date.UTC(sentY, sentM, sentD + 1, 12, 0, 0));
  const startDay = startDate.getUTCDate();

  // 최후의 월 (기산일의 월 + months)
  const targetRawMonth = startDate.getUTCMonth() + months;
  const targetYear =
    startDate.getUTCFullYear() + Math.floor(targetRawMonth / 12);
  const targetMonth = targetRawMonth % 12; // 0-indexed

  if (startDay === 1) {
    // 기산일이 월초(1일)이면 만료는 최후의 월의 전달 말일
    return new Date(Date.UTC(targetYear, targetMonth, 0, 12, 0, 0));
  }

  const daysInTargetMonth = new Date(
    Date.UTC(targetYear, targetMonth + 1, 0),
  ).getUTCDate();

  const resultDay = Math.min(startDay - 1, daysInTargetMonth);
  return new Date(Date.UTC(targetYear, targetMonth, resultDay, 12, 0, 0));
}

/**
 * 기한일이 비근무일이면 다음 첫 근무일로 순연한다.
 * 무한루프 방지용 최대 30일 탐색 제한.
 */
export function adjustForHolidays(date: Date): {
  original: Date;
  final: Date;
  deferred: boolean;
} {
  if (!isNonWorkingDay(date)) {
    return { original: date, final: date, deferred: false };
  }

  let current = date;
  let count = 0;
  const MAX_SEARCH_DAYS = 30;

  while (isNonWorkingDay(current) && count < MAX_SEARCH_DAYS) {
    const nextMs = Date.UTC(
      current.getUTCFullYear(),
      current.getUTCMonth(),
      current.getUTCDate() + 1,
      12,
      0,
      0,
    );
    current = new Date(nextMs);
    count++;
  }

  return { original: date, final: current, deferred: true };
}

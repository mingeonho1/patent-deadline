import {
  calculateDeadline,
  adjustForHolidays,
} from "@/features/calculator/deadline";
import { calculateExtensionFee } from "@/features/calculator/fee";

export type TimelineEntry = {
  extensionMonths: number;
  originalDeadline: Date;
  deadline: Date;
  deferred: boolean;
  cumulativeFee: number;
  // 5회차 이상은 정당한 사유 소명 필요 (RULES.md §2)
  needsJustification: boolean;
};

const EXTENSION_RANGE = [0, 1, 2, 3, 4, 5, 6] as const;

export function buildTimeline(
  sentDate: Date,
  baseMonths: number,
): TimelineEntry[] {
  return EXTENSION_RANGE.map((extensionMonths) => {
    const raw = calculateDeadline(sentDate, baseMonths + extensionMonths);
    const { original, final, deferred } = adjustForHolidays(raw);

    return {
      extensionMonths,
      originalDeadline: original,
      deadline: final,
      deferred,
      cumulativeFee: calculateExtensionFee(extensionMonths),
      needsJustification: extensionMonths >= 5,
    };
  });
}

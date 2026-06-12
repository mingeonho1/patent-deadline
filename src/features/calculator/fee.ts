// 특허료 등의 징수규칙 제2조 제1항 11의2 기준
// 누적 연장월수별 구간 금액의 합계 반환

const FEE_TABLE = [
  20_000, // 1개월차
  30_000, // 2개월차
  60_000, // 3개월차
  120_000, // 4개월차
] as const;

const FEE_PER_EXTRA_MONTH = 240_000; // 4개월 초과분 월 단위

export function calculateExtensionFee(totalExtensionMonths: number): number {
  if (totalExtensionMonths <= 0) return 0;

  const tableMonths = Math.min(totalExtensionMonths, FEE_TABLE.length);
  const baseFee = FEE_TABLE.slice(0, tableMonths).reduce(
    (sum, fee) => sum + fee,
    0,
  );

  const extraMonths = Math.max(0, totalExtensionMonths - FEE_TABLE.length);
  return baseFee + extraMonths * FEE_PER_EXTRA_MONTH;
}

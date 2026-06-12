import type { TimelineEntry } from "@/features/calculator/timeline";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function calculateDday(deadline: Date, today: Date): string {
  const deadlineUtc = Date.UTC(
    deadline.getUTCFullYear(),
    deadline.getUTCMonth(),
    deadline.getUTCDate(),
  );

  // KST 기준 오늘 날짜 (UTC+9)
  const kst = new Date(today.getTime() + 9 * 60 * 60 * 1000);
  const todayUtc = Date.UTC(
    kst.getUTCFullYear(),
    kst.getUTCMonth(),
    kst.getUTCDate(),
  );

  const diffDays = Math.round((deadlineUtc - todayUtc) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "D-0";
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const weekday = WEEKDAY_LABELS[date.getUTCDay()];
  return `${y}-${m}-${d} (${weekday})`;
}

function formatFee(fee: number): string {
  if (fee === 0) return "0원";
  return fee.toLocaleString("ko-KR") + "원";
}

function EntryLabel({ extensionMonths }: { extensionMonths: number }) {
  if (extensionMonths === 0)
    return <span className="font-semibold text-gray-800">기본 기한</span>;
  return (
    <span className="font-semibold text-gray-800">
      +{extensionMonths}개월 연장
    </span>
  );
}

function DeferredNote({
  originalDeadline,
  deadline,
}: {
  originalDeadline: Date;
  deadline: Date;
}) {
  return (
    <p className="text-xs text-amber-700 mt-1">
      원래 만료일 {formatDate(originalDeadline)} → 순연된 날짜{" "}
      {formatDate(deadline)}
    </p>
  );
}

type TimelineViewProps = {
  entries: TimelineEntry[];
  today: Date;
};

export function TimelineView({ entries, today }: TimelineViewProps) {
  return (
    <div className="mt-8 space-y-3">
      <h2 className="text-lg font-bold text-gray-900">기한 타임라인</h2>

      <ul className="space-y-3">
        {entries.map((entry) => {
          const dday = calculateDday(entry.deadline, today);
          const isPastDeadline = dday.startsWith("D+");

          return (
            <li
              key={entry.extensionMonths}
              className={[
                "rounded-lg border p-4",
                isPastDeadline
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-white",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <EntryLabel extensionMonths={entry.extensionMonths} />
                  {entry.needsJustification && (
                    <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      5회차부터 정당한 사유 소명 필요
                    </span>
                  )}
                </div>
                <span
                  className={[
                    "text-sm font-mono font-semibold",
                    isPastDeadline ? "text-red-600" : "text-blue-700",
                  ].join(" ")}
                >
                  {dday}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-700">
                {formatDate(entry.deadline)}
              </p>

              {entry.deferred && (
                <DeferredNote
                  originalDeadline={entry.originalDeadline}
                  deadline={entry.deadline}
                />
              )}

              <p className="mt-2 text-sm text-gray-500">
                누적 수수료: {formatFee(entry.cumulativeFee)}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500 space-y-1">
        <p>
          본 계산 결과는 참고용이며 법적 효력이 없습니다. 공식 기한은 특허청
          통지서에 기재된 내용을 기준으로 하며, 임시공휴일 등은 반영되지 않을 수
          있습니다.
        </p>
        <p className="font-medium">임시공휴일은 반영되지 않습니다.</p>
      </div>
    </div>
  );
}

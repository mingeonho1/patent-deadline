import Link from "next/link";
import { WaitlistForm } from "@/features/waitlist/ui/waitlist-form";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 히어로 섹션 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            OA 기한, 더 이상 달력 세지 마세요
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            발송일만 넣으면 연장 6개월치 기한과 수수료까지 한 번에.
          </p>
          <Link
            href="/calculator"
            className="mt-8 inline-block rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            기한 계산하기
          </Link>
        </div>

        {/* 대기명단 섹션 */}
        <section className="mx-auto mt-16 w-full max-w-md">
          <h2 className="text-lg font-bold text-gray-900 mb-1 text-center">
            출시 알림 신청
          </h2>
          <p className="text-sm text-gray-500 mb-4 text-center">
            서비스 출시 소식을 이메일로 받아보세요.
          </p>
          <WaitlistForm />
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 bg-white px-4 py-6">
        <p className="mx-auto max-w-2xl text-center text-xs text-gray-400">
          본 계산 결과는 참고용이며 법적 효력이 없습니다. 공식 기한은 특허청
          통지서에 기재된 내용을 기준으로 하며, 임시공휴일 등은 반영되지 않을 수
          있습니다.
        </p>
      </footer>
    </div>
  );
}

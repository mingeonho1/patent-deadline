import { CalculatorForm } from "@/features/calculator/ui/calculator-form";
import { WaitlistForm } from "@/features/waitlist/ui/waitlist-form";

export default function CalculatorPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          OA 기한 계산기
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          의견제출통지서 발송일과 기본기간을 입력하면 연장 시나리오별 기한을
          확인할 수 있습니다.
        </p>
        <CalculatorForm />

        <section className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            출시 알림 신청
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            서비스 출시 소식을 이메일로 받아보세요.
          </p>
          <WaitlistForm />
        </section>
      </div>
    </main>
  );
}

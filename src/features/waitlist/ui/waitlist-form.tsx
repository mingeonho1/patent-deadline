"use client";

import { useState } from "react";
import { joinWaitlist } from "@/features/waitlist/actions";

type FormState = "idle" | "loading" | "error" | "success";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setErrorMessage("");

    const result = await joinWaitlist(email);

    if (result.ok) {
      setState("success");
    } else {
      setErrorMessage(result.error);
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        등록되었습니다. 서비스 출시 시 알려드리겠습니다.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div>
        <label
          htmlFor="waitlist-email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          이메일 주소
        </label>
        <input
          id="waitlist-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="example@company.com"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={state === "loading"}
        />
        {state === "error" && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errorMessage}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "처리 중..." : "알림 신청하기"}
      </button>
    </form>
  );
}

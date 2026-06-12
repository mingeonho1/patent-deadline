import { describe, it, expect, vi, beforeEach } from "vitest";

const { emails } = vi.hoisted(() => {
  const emails = new Set<string>();
  return { emails };
});

vi.mock("./storage", () => ({
  waitlistStorage: {
    add: vi.fn(async (email: string) => {
      emails.add(email);
    }),
    list: vi.fn(async () => Array.from(emails)),
  },
}));

import { joinWaitlist } from "./actions";

describe("joinWaitlist 액션", () => {
  beforeEach(() => {
    emails.clear();
    vi.clearAllMocks();
  });

  it("유효한 이메일을 제출하면 성공을 반환한다", async () => {
    const result = await joinWaitlist("user@example.com");
    expect(result.ok).toBe(true);
  });

  it("잘못된 이메일 형식은 한국어 에러 메시지를 반환한다", async () => {
    const result = await joinWaitlist("not-an-email");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("올바른 이메일 주소를 입력해주세요.");
    }
  });

  it("빈 이메일은 에러를 반환한다", async () => {
    const result = await joinWaitlist("");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it("동일한 이메일을 두 번 제출해도 에러 없이 처리된다", async () => {
    const email = "dup@example.com";
    const first = await joinWaitlist(email);
    const second = await joinWaitlist(email);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(emails.size).toBe(1);
  });
});

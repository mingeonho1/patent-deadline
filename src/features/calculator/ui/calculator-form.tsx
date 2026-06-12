"use client";

import { useState } from "react";
import {
  calculatorInputSchema,
  resolveBaseMonths,
} from "@/features/calculator/schema";
import { buildTimeline } from "@/features/calculator/timeline";
import type { TimelineEntry } from "@/features/calculator/timeline";
import { TimelineView } from "@/features/calculator/ui/timeline-view";
import {
  SentDateField,
  BaseMonthsField,
} from "@/features/calculator/ui/form-fields";
import type {
  BaseMonthsType,
  FormErrors,
} from "@/features/calculator/ui/form-fields";

function parseFormResult(
  sentDate: string,
  baseMonthsType: BaseMonthsType,
  customMonths: string,
): { errors: FormErrors } | { entries: TimelineEntry[] } {
  const rawInput = {
    sentDate,
    baseMonthsType,
    customMonths:
      baseMonthsType === "custom" && customMonths !== ""
        ? parseInt(customMonths, 10)
        : undefined,
  };

  const result = calculatorInputSchema.safeParse(rawInput);

  if (!result.success) {
    const fieldErrors: FormErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field === "sentDate") fieldErrors.sentDate = issue.message;
      else if (field === "baseMonthsType")
        fieldErrors.baseMonthsType = issue.message;
      else if (field === "customMonths" || issue.path.length === 0)
        fieldErrors.customMonths = issue.message;
    }
    return { errors: fieldErrors };
  }

  const input = result.data;
  const parsedDate = new Date(input.sentDate + "T12:00:00Z");
  const baseMonths = resolveBaseMonths(input);
  return { entries: buildTimeline(parsedDate, baseMonths) };
}

export function CalculatorForm() {
  const [sentDate, setSentDate] = useState("");
  const [baseMonthsType, setBaseMonthsType] = useState<BaseMonthsType>("4");
  const [customMonths, setCustomMonths] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [timeline, setTimeline] = useState<TimelineEntry[] | null>(null);

  function handleBaseMonthsChange(value: BaseMonthsType) {
    setBaseMonthsType(value);
    if (value !== "custom") {
      setCustomMonths("");
      setErrors((prev) => ({
        ...prev,
        baseMonthsType: undefined,
        customMonths: undefined,
      }));
    } else {
      setErrors((prev) => ({ ...prev, baseMonthsType: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = parseFormResult(sentDate, baseMonthsType, customMonths);
    if ("errors" in parsed) {
      setErrors(parsed.errors);
      setTimeline(null);
      return;
    }
    setErrors({});
    setTimeline(parsed.entries);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <SentDateField
          value={sentDate}
          error={errors.sentDate}
          onChange={(v) => {
            setSentDate(v);
            setErrors((prev) => ({ ...prev, sentDate: undefined }));
          }}
        />
        <BaseMonthsField
          baseMonthsType={baseMonthsType}
          customMonths={customMonths}
          errors={errors}
          onBaseMonthsChange={handleBaseMonthsChange}
          onCustomMonthsChange={(v) => {
            setCustomMonths(v);
            setErrors((prev) => ({ ...prev, customMonths: undefined }));
          }}
        />
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          기한 계산하기
        </button>
      </form>

      {timeline !== null && (
        <TimelineView entries={timeline} today={new Date()} />
      )}
    </div>
  );
}

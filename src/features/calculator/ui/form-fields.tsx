import type { BaseMonthsType } from "@/features/calculator/schema";

type RadioOptionProps = {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  label: string;
  onChange: () => void;
};

function RadioOption({
  id,
  name,
  value,
  checked,
  label,
  onChange,
}: RadioOptionProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

type SentDateFieldProps = {
  value: string;
  error?: string;
  onChange: (v: string) => void;
};

export function SentDateField({ value, error, onChange }: SentDateFieldProps) {
  return (
    <div>
      <label
        htmlFor="sentDate"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        OA 발송일
      </label>
      <p className="text-xs text-gray-500 mb-2">
        통지서 좌측 상단의 제출기일/지정기간을 확인하세요
      </p>
      <input
        id="sentDate"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={[
          "block w-full rounded-md border px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white",
        ].join(" ")}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export type { BaseMonthsType };

export type FormErrors = {
  sentDate?: string;
  baseMonthsType?: string;
  customMonths?: string;
};

type BaseMonthsFieldProps = {
  baseMonthsType: BaseMonthsType;
  customMonths: string;
  errors: FormErrors;
  onBaseMonthsChange: (v: BaseMonthsType) => void;
  onCustomMonthsChange: (v: string) => void;
};

export function BaseMonthsField({
  baseMonthsType,
  customMonths,
  errors,
  onBaseMonthsChange,
  onCustomMonthsChange,
}: BaseMonthsFieldProps) {
  return (
    <fieldset>
      <legend className="block text-sm font-medium text-gray-700 mb-2">
        기본기간
      </legend>
      {errors.baseMonthsType && (
        <p className="mb-1 text-xs text-red-600">{errors.baseMonthsType}</p>
      )}
      <div className="space-y-2">
        <RadioOption
          id="base-4"
          name="baseMonthsType"
          value="4"
          checked={baseMonthsType === "4"}
          label="4개월 (2025.7.11 이후 발송)"
          onChange={() => onBaseMonthsChange("4")}
        />
        <RadioOption
          id="base-2"
          name="baseMonthsType"
          value="2"
          checked={baseMonthsType === "2"}
          label="2개월 (그 이전 발송)"
          onChange={() => onBaseMonthsChange("2")}
        />
        <RadioOption
          id="base-custom"
          name="baseMonthsType"
          value="custom"
          checked={baseMonthsType === "custom"}
          label="직접 입력 (1~12 정수)"
          onChange={() => onBaseMonthsChange("custom")}
        />
      </div>
      {baseMonthsType === "custom" && (
        <div className="mt-3 ml-6">
          <input
            id="customMonths"
            type="number"
            min={1}
            max={12}
            value={customMonths}
            onChange={(e) => onCustomMonthsChange(e.target.value)}
            placeholder="1~12"
            className={[
              "block w-24 rounded-md border px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              errors.customMonths
                ? "border-red-400 bg-red-50"
                : "border-gray-300 bg-white",
            ].join(" ")}
          />
          {errors.customMonths && (
            <p className="mt-1 text-xs text-red-600">{errors.customMonths}</p>
          )}
        </div>
      )}
    </fieldset>
  );
}

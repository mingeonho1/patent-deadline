import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // ---- 비대화 방지 (숫자 게이트) ----
      "max-lines": [
        "error",
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 40, skipBlankLines: true, skipComments: true },
      ],
      "max-depth": ["error", 3],
      complexity: ["error", 10],
      "max-params": ["error", 3],

      // ---- 타입 탈출 차단 ----
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],

      // ---- 기타 클린코드 ----
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-nested-ternary": "error",
    },
  },
  {
    // React 컴포넌트(JSX)는 마크업 때문에 함수가 길어질 수 있어 한도를 완화
    files: ["**/*.tsx"],
    rules: {
      "max-lines-per-function": [
        "error",
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    // 테스트는 길이 규칙에서 제외
    files: ["**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "max-lines-per-function": "off",
      "max-lines": "off",
    },
  },
  // eslint-config-next 기본 ignore 재정의
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;

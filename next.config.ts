import type { NextConfig } from "next";
// 빌드 타임에 env 검증 실행 — 미설정 변수가 있으면 빌드가 즉시 실패한다
import "./src/lib/env";

const nextConfig: NextConfig = {};

export default nextConfig;

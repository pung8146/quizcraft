import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16에서 eslint 설정은 next.config.ts에서 제거됨
  // 대신 .eslintrc 또는 package.json에서 설정
  typescript: {
    // 타입 검사 오류 시 빌드 계속 진행 (개발 중에만 사용)
    ignoreBuildErrors: false,
  },
  // Turbopack 설정 (Next.js 16 기본 번들러)
  turbopack: {},
  // 성능 최적화
  experimental: {
    optimizePackageImports: ["@supabase/supabase-js"],
  },
  // webpack 설정 추가 - pdf-parse 패키지 호환성 개선
  webpack: (config) => {
    // pdf-parse 패키지의 테스트 파일 참조 문제 해결
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // pdf-parse-new 패키지 최적화
    config.module.rules.push({
      test: /pdf-parse-new/,
      resolve: {
        alias: {
          "./test/data/05-versions-space.pdf": false,
        },
      },
    });

    return config;
  },
};

export default nextConfig;

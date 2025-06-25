import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Vercel 배포 시 ESLint 오류로 빌드 실패를 방지
    // 경고는 허용하고, 오류만 빌드 실패로 처리
    ignoreDuringBuilds: false,
  },
  typescript: {
    // 타입 검사 오류 시 빌드 계속 진행 (개발 중에만 사용)
    ignoreBuildErrors: false,
  },
  // 성능 최적화
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
};

export default nextConfig;

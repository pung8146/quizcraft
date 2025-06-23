'use client';

import { useState, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('구글 로그인 시작...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('OAuth 응답:', { data, error });

      if (error) {
        console.error('구글 로그인 에러:', error);
        setError(`로그인 오류: ${error.message}`);
      } else if (data) {
        console.log('OAuth URL 생성됨:', data.url);
      }
    } catch (err) {
      console.error('구글 로그인 예외:', err);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    router.push('/');
  };

  const handleKeyDown = (event: KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            로그인 방식 선택
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            구글 계정으로 로그인하거나 게스트 모드로 이용하세요
          </p>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* 구글 로그인 */}
        <button
          onClick={handleGoogleLogin}
          onKeyDown={(e) => handleKeyDown(e, handleGoogleLogin)}
          disabled={isLoading}
          tabIndex={0}
          aria-label="구글로 로그인"
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="flex-shrink-0"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span>구글로 로그인</span>
            </>
          )}
        </button>

        {/* 구분선 */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="bg-white px-2 text-gray-500">또는</span>
          </div>
        </div>

        {/* 이메일 로그인 */}
        <Link
          href="/email-login"
          className="w-full flex items-center justify-center gap-3 bg-blue-600 border border-blue-600 rounded-lg px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors mb-4"
        >
          <span className="text-lg">📧</span>
          <span>이메일로 로그인</span>
        </Link>

        {/* 구분선 */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="bg-white px-2 text-gray-500">또는</span>
          </div>
        </div>

        {/* 게스트 모드 */}
        <button
          onClick={handleGuestMode}
          onKeyDown={(e) => handleKeyDown(e, handleGuestMode)}
          tabIndex={0}
          aria-label="게스트 모드로 계속하기"
          className="w-full flex items-center justify-center gap-3 bg-gray-100 border border-gray-300 rounded-lg px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          <span className="text-lg">🔓</span>
          <span>게스트 모드로 계속하기</span>
        </button>

        {/* 각 모드의 설명 */}
        <div className="mt-6 space-y-3 text-xs sm:text-sm text-gray-500">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">
              ✅ 구글 로그인 시
            </h4>
            <p className="text-blue-800">
              퀴즈 기록이 클라우드에 저장되어 어디서든 접근 가능
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-green-900 mb-1">
              📧 이메일 로그인 시
            </h4>
            <p className="text-green-800">
              이메일과 비밀번호로 안전하게 로그인
            </p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">
              🔓 게스트 모드 시
            </h4>
            <p className="text-gray-700">
              로컬 저장소 사용, 브라우저에서만 데이터 유지
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            계속 진행하시면{' '}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-500 hover:underline focus:underline focus:outline-none"
            >
              이용약관
            </a>
            과{' '}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-500 hover:underline focus:underline focus:outline-none"
            >
              개인정보처리방침
            </a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

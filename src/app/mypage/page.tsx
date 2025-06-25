'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCount, setQuizCount] = useState(0);

  useEffect(() => {
    loadUserData();
    getQuizCount();
  }, []);

  const loadUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('사용자 정보 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuizCount = () => {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('quiz-')) {
        count++;
      }
    }
    setQuizCount(count);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12">
          <div className="text-center py-16 sm:py-20">
            <div className="text-6xl sm:text-7xl mb-4">🔒</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-3">
              로그인이 필요합니다
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto">
              마이페이지에 접근하려면 먼저 로그인해주세요.
            </p>
            <Link
              href="/login"
              className="inline-block w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              로그인하기 →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12">
        {/* 헤더 섹션 */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            👤 마이페이지
          </h1>
          <p className="text-gray-600">
            프로필 정보와 계정 설정을 관리할 수 있습니다.
          </p>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white border rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="프로필 이미지"
                className="w-20 h-20 rounded-full mx-auto sm:mx-0"
              />
            )}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {user.user_metadata?.name || user.email}
              </h2>
              <p className="text-gray-600 mb-1">{user.email}</p>
              {user.created_at && (
                <p className="text-sm text-gray-500">
                  가입일: {formatDate(user.created_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">생성한 퀴즈</p>
                <p className="text-2xl font-bold text-gray-900">
                  {quizCount}개
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">활동 상태</p>
                <p className="text-2xl font-bold text-gray-900">활성</p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">🏆</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">레벨</p>
                <p className="text-2xl font-bold text-gray-900">초보자</p>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 액션 카드들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/history"
            className="block bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  📚 퀴즈 히스토리
                </h3>
                <p className="text-gray-600 text-sm">
                  생성한 모든 퀴즈들을 확인하고 관리하세요
                </p>
                <p className="text-blue-600 text-sm mt-2">
                  {quizCount}개의 퀴즈가 있습니다
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="block bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  ➕ 새 퀴즈 만들기
                </h3>
                <p className="text-gray-600 text-sm">
                  마크다운 문서로 새로운 퀴즈를 생성하세요
                </p>
              </div>
              <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* 계정 설정 섹션 */}
        <div className="mt-8 bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            계정 설정
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">계정 타입</p>
                <p className="text-xs text-gray-500">
                  현재 사용 중인 계정 타입
                </p>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                무료 계정
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-700">데이터 저장</p>
                <p className="text-xs text-gray-500">퀴즈 데이터 저장 방식</p>
              </div>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                로컬 + 클라우드
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

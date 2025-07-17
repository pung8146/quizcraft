"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  isMobileMenuOpen: boolean;
}

// 스켈레톤 컴포넌트
const SkeletonItem = () => (
  <div className="flex items-center p-2 rounded-lg animate-pulse">
    <div className="w-5 h-5 bg-gray-200 rounded"></div>
    <div className="ml-3 h-4 bg-gray-200 rounded w-20"></div>
  </div>
);

// 사용자 정보 스켈레톤
const UserSkeleton = () => (
  <div className="flex items-center space-x-4 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
    <div className="flex-1 min-w-0">
      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
      <div className="h-3 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export default function Sidebar({ isMobileMenuOpen }: SidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const { signOut } = useAuth();

  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error("사용자 정보 로딩 오류:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  const activeLinkClasses = "bg-blue-100 text-blue-700";
  const inactiveLinkClasses =
    "text-gray-600 hover:text-blue-600 hover:bg-gray-50";

  return (
    <aside
      className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r transition-transform md:translate-x-0 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-full px-3 py-4 overflow-y-auto">
        <div className="flex items-center justify-between h-16 mb-4 px-4">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            QuizCraft
          </Link>
        </div>

        <ul className="space-y-2 font-medium">
          {/* 퀴즈 생성 */}
          <li>
            <Link
              href="/"
              className={`flex items-center min-h-[40px] p-2 rounded-lg ${
                pathname === "/" ? activeLinkClasses : inactiveLinkClasses
              }`}
            >
              <svg
                className="w-5 h-5 shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 overflow-visible"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
              </svg>
              <span className="ml-3">퀴즈 생성</span>
            </Link>
          </li>

          {/* 퀴즈 히스토리 - 모든 사용자가 접근 가능 */}
          <li>
            <Link
              href="/history"
              className={`flex items-center min-h-[40px] p-2 rounded-lg ${
                pathname === "/history"
                  ? activeLinkClasses
                  : inactiveLinkClasses
              }`}
            >
              <svg
                className="w-5 h-5 shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 overflow-visible"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
              </svg>
              <span className="ml-3">퀴즈 히스토리</span>
            </Link>
          </li>

          {/* 오답 노트 - 모든 사용자가 접근 가능 */}
          <li>
            <Link
              href="/wrong-answers"
              className={`flex items-center min-h-[40px] p-2 rounded-lg ${
                pathname === "/wrong-answers"
                  ? activeLinkClasses
                  : inactiveLinkClasses
              }`}
            >
              <svg
                className="w-5 h-5 shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 overflow-visible"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-3">오답 노트</span>
            </Link>
          </li>

          {/* 문의게시판 - 모든 사용자가 접근 가능 */}
          <li>
            <Link
              href="/inquiry"
              className={`flex items-center min-h-[40px] p-2 rounded-lg ${
                pathname === "/inquiry"
                  ? activeLinkClasses
                  : inactiveLinkClasses
              }`}
            >
              <svg
                className="w-5 h-5 shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 overflow-visible"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="ml-3">문의게시판</span>
            </Link>
          </li>

          {/* 즐겨찾기 - 로그인한 사용자만 */}
          {isLoading ? (
            <li>
              <SkeletonItem />
            </li>
          ) : user ? (
            <li>
              <Link
                href="/favorites"
                className={`flex items-center min-h-[40px] p-2 rounded-lg ${
                  pathname === "/favorites"
                    ? activeLinkClasses
                    : inactiveLinkClasses
                }`}
              >
                <svg
                  className="w-5 h-5 shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 overflow-visible"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="ml-3">즐겨찾기</span>
              </Link>
            </li>
          ) : null}

          {/* 마이페이지 - 로그인한 사용자만 */}
          {isLoading ? (
            <li>
              <SkeletonItem />
            </li>
          ) : user ? (
            <li>
              <Link
                href="/mypage"
                className={`flex items-center min-h-[40px] p-2 rounded-lg ${
                  pathname === "/mypage"
                    ? activeLinkClasses
                    : inactiveLinkClasses
                }`}
              >
                <svg
                  className="w-5 h-5 shrink-0 text-gray-500 transition duration-75 group-hover:text-gray-900 overflow-visible"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                </svg>
                <span className="ml-3">마이페이지</span>
              </Link>
            </li>
          ) : null}
        </ul>

        {/* 게스트 사용자를 위한 간단한 안내 */}
        {!isLoading && !user && (
          <div className="mt-8">
            <Link
              href="/login"
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              로그인하기
            </Link>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 border-t">
          {isLoading ? (
            <UserSkeleton />
          ) : user ? (
            <div className="flex items-center space-x-4">
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="프로필"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.user_metadata?.name || user.email}
                </p>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-center p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

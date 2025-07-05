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

export default function Sidebar({ isMobileMenuOpen }: SidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const { signOut } = useAuth();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
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
              className={`flex items-center p-2 rounded-lg ${
                pathname === "/" ? activeLinkClasses : inactiveLinkClasses
              }`}
            >
              <svg
                className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="ml-3">퀴즈 생성</span>
            </Link>
          </li>

          {/* 퀴즈 히스토리 - 모든 사용자가 접근 가능 */}
          <li>
            <Link
              href="/history"
              className={`flex items-center p-2 rounded-lg ${
                pathname === "/history"
                  ? activeLinkClasses
                  : inactiveLinkClasses
              }`}
            >
              <svg
                className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
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

          {/* 오답 노트 - 로그인한 사용자만 */}
          {user && (
            <li>
              <Link
                href="/wrong-answers"
                className={`flex items-center p-2 rounded-lg ${
                  pathname === "/wrong-answers"
                    ? activeLinkClasses
                    : inactiveLinkClasses
                }`}
              >
                <svg
                  className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                </svg>
                <span className="ml-3">📝 오답 노트</span>
              </Link>
            </li>
          )}

          {/* 문의게시판 - 모든 사용자가 접근 가능 */}
          <li>
            <Link
              href="/inquiry"
              className={`flex items-center p-2 rounded-lg ${
                pathname === "/inquiry"
                  ? activeLinkClasses
                  : inactiveLinkClasses
              }`}
            >
              <svg
                className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="ml-3">문의게시판</span>
            </Link>
          </li>

          {/* 마이페이지 - 로그인한 사용자만 */}
          {user && (
            <li>
              <Link
                href="/mypage"
                className={`flex items-center p-2 rounded-lg ${
                  pathname === "/mypage"
                    ? activeLinkClasses
                    : inactiveLinkClasses
                }`}
              >
                <svg
                  className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
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
          )}
        </ul>

        {/* 게스트 사용자를 위한 간단한 안내 */}
        {!user && (
          <div className="mt-8">
            <Link
              href="/login"
              className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span className="mr-2">🔐</span>
              로그인하기
            </Link>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-4 border-t">
          {user ? (
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

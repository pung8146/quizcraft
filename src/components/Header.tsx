"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  return (
    <header className="w-full bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex-shrink-0">
            <h1
              className="text-lg sm:text-xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => handleNavigation("/")}
              tabIndex={0}
              aria-label="홈으로 이동"
              onKeyDown={(e) => handleKeyDown(e, () => handleNavigation("/"))}
            >
              📘 MarkdownQuiz
            </h1>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleNavigation("/")}
                className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  pathname === "/"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
                tabIndex={0}
                aria-label="마크다운 제출 페이지"
              >
                📝 문서 제출
              </button>

              <button
                onClick={() => handleNavigation("/history")}
                className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  pathname === "/history"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
                tabIndex={0}
                aria-label="제출 히스토리 페이지"
              >
                📊 히스토리
              </button>
            </div>

            {/* 데스크톱 사용자 메뉴 */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 hidden lg:block">
                    👤 {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    tabIndex={0}
                    aria-label="로그아웃"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors"
                    tabIndex={0}
                    aria-label="로그인 페이지로 이동"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => handleNavigation("/signup")}
                    className="text-sm text-gray-600 hover:text-blue-600 hover:underline transition-colors"
                    tabIndex={0}
                    aria-label="회원가입 페이지로 이동"
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              onKeyDown={(e) => handleKeyDown(e, toggleMobileMenu)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              tabIndex={0}
              aria-label="메뉴 열기"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            <button
              onClick={() => handleNavigation("/")}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors ${
                pathname === "/"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
              tabIndex={0}
              aria-label="마크다운 제출 페이지"
            >
              📝 문서 제출
            </button>

            <button
              onClick={() => handleNavigation("/history")}
              className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors ${
                pathname === "/history"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
              tabIndex={0}
              aria-label="제출 히스토리 페이지"
            >
              📊 히스토리
            </button>

            {/* 모바일 사용자 메뉴 */}
            <div className="border-t border-gray-200 pt-4 pb-3">
              {user ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm text-gray-600">
                    👤 {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 w-full text-left transition-colors"
                    tabIndex={0}
                    aria-label="로그아웃"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 w-full text-left transition-colors"
                    tabIndex={0}
                    aria-label="로그인 페이지로 이동"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => handleNavigation("/signup")}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 w-full text-left transition-colors"
                    tabIndex={0}
                    aria-label="회원가입 페이지로 이동"
                  >
                    회원가입
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { demoQuizzes } from "@/lib/demoData";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuizDropdownOpen, setIsQuizDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".quiz-dropdown")) {
        setIsQuizDropdownOpen(false);
      }
    };

    if (isQuizDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isQuizDropdownOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
    setIsQuizDropdownOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleQuizDropdown = () => {
    setIsQuizDropdownOpen(!isQuizDropdownOpen);
  };

  const selectQuizSample = (content: string) => {
    // localStorage에 선택된 퀴즈 내용 저장
    localStorage.setItem("selectedQuizContent", content);
    handleNavigation("/");
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

              {/* 문제목록 드롭다운 */}
              <div className="relative quiz-dropdown">
                <button
                  onClick={toggleQuizDropdown}
                  className="px-3 py-2 rounded-md transition-colors text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 flex items-center"
                  tabIndex={0}
                  aria-label="문제목록"
                  aria-haspopup="true"
                  aria-expanded={isQuizDropdownOpen}
                >
                  📚 문제목록
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform ${
                      isQuizDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* 드롭다운 메뉴 */}
                {isQuizDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                        샘플 퀴즈
                      </div>
                      {demoQuizzes.map((quiz) => (
                        <button
                          key={quiz.id}
                          onClick={() => selectQuizSample(quiz.content)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          tabIndex={0}
                          aria-label={`${quiz.title} 선택`}
                        >
                          {quiz.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500">🔓 게스트 모드</span>
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    tabIndex={0}
                    aria-label="구글로 로그인"
                  >
                    구글 로그인
                  </button>
                </div>
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

            {/* 모바일 문제목록 */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-sm font-medium text-gray-500">
                📚 문제목록
              </div>
              {demoQuizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => selectQuizSample(quiz.content)}
                  className="block px-6 py-2 rounded-md text-sm font-medium w-full text-left transition-colors text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  tabIndex={0}
                  aria-label={`${quiz.title} 선택`}
                >
                  {quiz.title}
                </button>
              ))}
            </div>

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
                <div className="space-y-3">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    🔓 현재 게스트 모드로 이용 중
                  </div>
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="mx-3 w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    tabIndex={0}
                    aria-label="구글로 로그인"
                  >
                    구글 로그인
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

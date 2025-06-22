"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import { demoQuizzes } from "@/lib/demoData";

interface SidebarProps {
  isMobileMenuOpen: boolean;
}

export default function Sidebar({ isMobileMenuOpen }: SidebarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isQuizDropdownOpen, setIsQuizDropdownOpen] = useState(false);
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
          <li>
            <Link
              href="/"
              className={`flex items-center p-2 rounded-lg ${
                pathname === "/" ? activeLinkClasses : inactiveLinkClasses
              }`}
            >
              <span className="ml-3">퀴즈 만들기</span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              className={`flex items-center w-full p-2 text-left rounded-lg ${inactiveLinkClasses}`}
              onClick={() => setIsQuizDropdownOpen(!isQuizDropdownOpen)}
            >
              <span className="flex-1 ml-3 whitespace-nowrap">문제목록</span>
              <svg
                className={`w-3 h-3 transition-transform ${
                  isQuizDropdownOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>
            {isQuizDropdownOpen && (
              <ul className="py-2 space-y-2">
                <li className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  샘플 퀴즈
                </li>
                {demoQuizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <Link
                      href={`/quizzes/${quiz.id}`}
                      className={`flex items-center w-full p-2 pl-11 rounded-lg transition duration-75 group ${inactiveLinkClasses}`}
                    >
                      {quiz.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li>
            <Link
              href="/history"
              className={`flex items-center p-2 rounded-lg ${
                pathname === "/history"
                  ? activeLinkClasses
                  : inactiveLinkClasses
              }`}
            >
              <span className="ml-3">히스토리</span>
            </Link>
          </li>
        </ul>

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

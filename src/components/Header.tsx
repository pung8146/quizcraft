"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
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
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <header className="w-full p-4 flex justify-between items-center border-b bg-white shadow-sm">
      <div className="flex items-center gap-8">
        <h1
          className="text-xl font-bold cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => handleNavigation("/")}
          tabIndex={0}
          aria-label="홈으로 이동"
          onKeyDown={(e) => e.key === "Enter" && handleNavigation("/")}
        >
          📘 MarkdownQuiz
        </h1>

        <nav className="flex items-center gap-6">
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
        </nav>
      </div>

      <nav className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-600">👤 {user.email}</span>
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
      </nav>
    </header>
  );
}

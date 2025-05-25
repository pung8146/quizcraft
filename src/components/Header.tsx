"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="w-full p-4 flex justify-between items-center border-b">
      <h1 className="text-xl font-bold">📘 MarkdownQuiz</h1>

      <nav className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm">👤 {user.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => (window.location.href = "/login")}
              className="text-sm hover:underline"
            >
              로그인
            </button>
            <button
              onClick={() => (window.location.href = "/signup")}
              className="text-sm hover:underline"
            >
              회원가입
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

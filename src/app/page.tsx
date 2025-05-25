"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";

export default function HomePage() {
  const [markdown, setMarkdown] = useState("");
  const router = useRouter();

  const handleGenerateQuiz = () => {
    if (!markdown.trim()) return alert("마크다운을 입력해주세요.");

    const slug = nanoid(8); // 랜덤 ID 생성
    localStorage.setItem(`quiz-${slug}`, markdown); // localStorage에 저장
    router.push(`/quiz/${slug}`); // 퀴즈 페이지로 이동
  };

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6">📘 Markdown Quiz 생성기</h1>

      <textarea
        className="w-full h-64 border rounded p-4 text-sm font-mono resize-none"
        placeholder="# 마크다운 문서를 여기에 붙여넣으세요"
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
      />

      <button
        onClick={handleGenerateQuiz}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        퀴즈 생성하기 →
      </button>
    </main>
  );
}

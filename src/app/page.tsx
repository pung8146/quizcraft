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
    const createdAt = new Date().toISOString();

    // 마크다운 내용 저장
    localStorage.setItem(`quiz-${slug}`, markdown);

    // 메타데이터 저장
    localStorage.setItem(
      `quiz-${slug}-meta`,
      JSON.stringify({
        createdAt,
        title: extractTitle(markdown),
      })
    );

    router.push(`/quiz/${slug}`); // 퀴즈 페이지로 이동
  };

  const extractTitle = (content: string): string => {
    const lines = content.split("\n");
    const titleLine = lines.find((line) => line.startsWith("# "));
    if (titleLine) {
      return titleLine.replace("# ", "").trim();
    }
    return content.substring(0, 50) + (content.length > 50 ? "..." : "");
  };

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">📘 Markdown Quiz 생성기</h1>
        <p className="text-gray-600">
          마크다운 문서를 붙여넣으면 자동으로 퀴즈를 생성해드립니다.
        </p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <label
          htmlFor="markdown-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          마크다운 문서
        </label>
        <textarea
          id="markdown-input"
          className="w-full h-64 border rounded-md p-4 text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="# 제목

## 섹션 1

내용을 여기에 입력하세요...

## 섹션 2

더 많은 내용..."
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          tabIndex={0}
          aria-label="마크다운 문서 입력"
        />

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            {markdown.length > 0
              ? `${markdown.length}자 입력됨`
              : "문서를 입력해주세요"}
          </div>
          <button
            onClick={handleGenerateQuiz}
            disabled={!markdown.trim()}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              markdown.trim()
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            tabIndex={0}
            aria-label="퀴즈 생성"
          >
            퀴즈 생성하기 →
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 사용 팁</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 제목과 섹션을 명확히 구분해주세요 (# 제목, ## 섹션)</li>
          <li>• 중요한 개념과 정의를 포함해주세요</li>
          <li>• 생성된 퀴즈는 히스토리에서 다시 확인할 수 있습니다</li>
        </ul>
      </div>
    </main>
  );
}

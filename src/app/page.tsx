"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import DemoDataControls from "@/components/DemoDataControls";
import { initializeDemoData } from "@/lib/demoData";

export default function HomePage() {
  const [markdown, setMarkdown] = useState("");
  const router = useRouter();

  // 페이지 로드 시 데모 데이터 자동 초기화 및 헤더에서 선택된 퀴즈 로드
  useEffect(() => {
    initializeDemoData();

    // 헤더에서 선택된 퀴즈 내용 확인
    const selectedContent = localStorage.getItem("selectedQuizContent");
    if (selectedContent) {
      setMarkdown(selectedContent);
      // 사용 후 제거
      localStorage.removeItem("selectedQuizContent");
    }
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
            📘 Markdown Quiz 생성기
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            마크다운 문서를 붙여넣으면 자동으로 퀴즈를 생성해드립니다.
          </p>
        </div>

        {/* 마크다운 입력 섹션 */}
        <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <label
            htmlFor="markdown-input"
            className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4"
          >
            마크다운 문서
          </label>
          <textarea
            id="markdown-input"
            className="w-full h-48 sm:h-64 lg:h-72 border rounded-md p-3 sm:p-4 text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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

          {/* 하단 정보 및 버튼 */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 sm:mt-6 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              {markdown.length > 0
                ? `${markdown.length}자 입력됨`
                : "문서를 입력해주세요"}
            </div>
            <button
              onClick={handleGenerateQuiz}
              disabled={!markdown.trim()}
              className={`order-1 sm:order-2 w-full sm:w-auto px-6 py-3 sm:py-2 rounded-md font-medium transition-colors ${
                markdown.trim()
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              tabIndex={0}
              aria-label="퀴즈 생성"
            >
              퀴즈 생성하기 →
            </button>
          </div>
        </div>

        {/* 사용 팁 */}
        <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h3 className="font-semibold text-blue-900 mb-3 text-base sm:text-lg">
            💡 사용 팁
          </h3>
          <ul className="text-sm sm:text-base text-blue-800 space-y-2">
            <li>• 제목과 섹션을 명확히 구분해주세요 (# 제목, ## 섹션)</li>
            <li>• 중요한 개념과 정의를 포함해주세요</li>
            <li>• 생성된 퀴즈는 히스토리에서 다시 확인할 수 있습니다</li>
          </ul>
        </div>

        {/* 개발자 도구 */}
        <DemoDataControls className="mt-6 sm:mt-8" />
      </div>
    </div>
  );
}

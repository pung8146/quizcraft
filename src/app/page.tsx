"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

interface QuizOptions {
  types: {
    multipleChoice: boolean;
    trueOrFalse: boolean;
    fillInBlank: boolean;
  };
  questionCount: number;
}

export default function HomePage() {
  const [markdown, setMarkdown] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizOptions, setQuizOptions] = useState<QuizOptions>({
    types: {
      multipleChoice: true,
      trueOrFalse: true,
      fillInBlank: true,
    },
    questionCount: 5,
  });
  const router = useRouter();
  const { user } = useAuth();

  const handleGenerateQuiz = async () => {
    if (!markdown.trim()) return alert("텍스트를 입력해주세요.");

    // 최소 하나의 문제 유형이 선택되어야 함
    const selectedTypes = Object.values(quizOptions.types).some(Boolean);
    if (!selectedTypes) {
      return alert("최소 하나의 문제 유형을 선택해주세요.");
    }

    setIsGenerating(true);

    try {
      const slug = nanoid(8); // 랜덤 ID 생성
      const createdAt = new Date().toISOString();

      // 텍스트 내용 저장
      localStorage.setItem(`quiz-${slug}`, markdown);

      // 메타데이터 저장 (사용자 정보 포함)
      localStorage.setItem(
        `quiz-${slug}-meta`,
        JSON.stringify({
          createdAt,
          title: extractTitle(markdown),
          userId: user?.id || "guest",
          userEmail: user?.email || null,
          isGuest: !user,
          quizOptions,
        })
      );

      // 로그인한 사용자인 경우 즉시 퀴즈 생성하고 DB에 저장
      if (user) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.access_token) {
            const response = await fetch("/api/generate-quiz", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                content: markdown,
                title: extractTitle(markdown),
                saveToDatabase: true,
                quizOptions,
              }),
            });

            const result = await response.json();

            if (result.success && result.data) {
              // 생성된 퀴즈를 localStorage에 저장
              localStorage.setItem(
                `quiz-${slug}-data`,
                JSON.stringify(result.data)
              );

              if (result.savedRecord) {
                console.log(
                  "✅ 퀴즈가 데이터베이스에 성공적으로 저장되었습니다:",
                  result.savedRecord.id
                );
              }
            }
          }
        } catch (error) {
          console.error("퀴즈 생성 및 저장 중 오류:", error);
          // 오류가 발생해도 계속 진행 (퀴즈 페이지에서 다시 생성)
        }
      }

      router.push(`/quiz/${slug}`); // 퀴즈 페이지로 이동
    } catch (error) {
      console.error("퀴즈 생성 중 오류:", error);
      alert("퀴즈 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
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
      <div className="max-w-4xl mx-auto ">
        {/* 헤더 섹션 */}

        {/* 사용자 상태 안내 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">👤</span>
              <p className="text-blue-800">
                <span className="font-medium">
                  {user.user_metadata?.name || user.email}
                </span>
                님, 환영합니다!
                <span className="block text-sm text-blue-600 mt-1">
                  생성한 퀴즈는 클라우드에 안전하게 저장됩니다.
                </span>
              </p>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">🌐</span>
              <p className="text-blue-800">
                <span className="font-medium">게스트 모드</span>로 이용
                중입니다.
                <span className="block text-sm text-blue-600 mt-1">
                  퀴즈는 브라우저에 임시 저장됩니다. 로그인하시면 안전하게
                  클라우드에 저장할 수 있습니다.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* 퀴즈 생성 옵션 */}
        <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⚙️ 퀴즈 생성 옵션
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 문제 유형 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                문제 유형 선택
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quizOptions.types.multipleChoice}
                    onChange={(e) =>
                      setQuizOptions((prev) => ({
                        ...prev,
                        types: {
                          ...prev.types,
                          multipleChoice: e.target.checked,
                        },
                      }))
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">📝 객관식</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quizOptions.types.trueOrFalse}
                    onChange={(e) =>
                      setQuizOptions((prev) => ({
                        ...prev,
                        types: {
                          ...prev.types,
                          trueOrFalse: e.target.checked,
                        },
                      }))
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">✅ O/X 문제</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quizOptions.types.fillInBlank}
                    onChange={(e) =>
                      setQuizOptions((prev) => ({
                        ...prev,
                        types: {
                          ...prev.types,
                          fillInBlank: e.target.checked,
                        },
                      }))
                    }
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">🔤 빈칸 추론</span>
                </label>
              </div>
            </div>

            {/* 문제 개수 설정 */}
            <div>
              <label
                htmlFor="question-count"
                className="block text-sm font-medium text-gray-700 mb-3"
              >
                문제 개수
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="question-count"
                  type="number"
                  min="1"
                  max="20"
                  value={quizOptions.questionCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value);
                    if (!isNaN(count) && count >= 1 && count <= 20) {
                      setQuizOptions((prev) => ({
                        ...prev,
                        questionCount: count,
                      }));
                    }
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-500">개 (최대 20개)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 문서 입력 섹션 */}
        <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <label
            htmlFor="markdown-input"
            className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4"
          >
            📄 문서 내용 입력
          </label>
          <p className="text-sm text-gray-500 mb-4">
            마크다운 문서나 블로그 포스팅 글을 복사해서 붙여넣으면, AI가
            자동으로 요약하고 다양한 퀴즈를 생성해드립니다.
          </p>
          <textarea
            id="markdown-input"
            className="w-full h-48 sm:h-64 lg:h-72 border rounded-md p-3 sm:p-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
            placeholder="여기에 학습하고 싶은 텍스트를 붙여넣어주세요...

예시:
# 인공지능의 개념
인공지능(AI)은 컴퓨터가 인간의 지능을 모방하여 학습하고 추론하는 기술입니다...

또는 블로그 포스팅이나 기사 내용을 그대로 복사해서 붙여넣으셔도 됩니다."
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            disabled={isGenerating}
            tabIndex={0}
            aria-label="문서 내용 입력"
          />

          {/* 하단 정보 및 버튼 */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 sm:mt-6 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              {markdown.length > 0
                ? `${markdown.length}자 입력됨`
                : "텍스트를 입력해주세요"}
            </div>
            <button
              onClick={handleGenerateQuiz}
              disabled={!markdown.trim() || isGenerating}
              className={`order-1 sm:order-2 w-full sm:w-auto px-6 py-3 sm:py-2 rounded-md font-medium transition-colors ${
                markdown.trim() && !isGenerating
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              tabIndex={0}
              aria-label="AI 퀴즈 생성"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  퀴즈 생성 중...
                </>
              ) : (
                "🤖 AI 퀴즈 생성하기 →"
              )}
            </button>
          </div>
        </div>

        {/* 빠른 액세스 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📚 퀴즈 히스토리
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              생성한 퀴즈들을 확인하고 관리하세요
            </p>
            <button
              onClick={() => router.push("/history")}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              히스토리 보기 →
            </button>
          </div>

          {!user && (
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🔐 로그인
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                로그인하고 퀴즈를 안전하게 저장하세요
              </p>
              <button
                onClick={() => router.push("/login")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                로그인하기 →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

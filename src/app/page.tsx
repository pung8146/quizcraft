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
  const [content, setContent] = useState("");
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

  // URL 여부를 판단하는 헬퍼 함수
  const isValidUrl = (text: string): boolean => {
    try {
      const trimmedText = text.trim();
      // URL 패턴 체크
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(trimmedText)) return false;

      // URL 생성자로 유효성 검증
      new URL(trimmedText);
      return true;
    } catch {
      return false;
    }
  };

  const handleGenerateQuiz = async () => {
    // 입력 검증
    if (!content.trim()) {
      return alert("내용을 입력해주세요.");
    }

    // 최소 하나의 문제 유형이 선택되어야 함
    const selectedTypes = Object.values(quizOptions.types).some(Boolean);
    if (!selectedTypes) {
      return alert("최소 하나의 문제 유형을 선택해주세요.");
    }

    const trimmedContent = content.trim();
    const isUrl = isValidUrl(trimmedContent);

    setIsGenerating(true);

    try {
      const slug = nanoid(8); // 랜덤 ID 생성
      const createdAt = new Date().toISOString();

      let contentToProcess = "";
      let titleToUse = "";

      if (isUrl) {
        // URL 모드인 경우 URL 분석
        console.log("🔍 URL 분석 중...");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const response = await fetch("/api/analyze-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token && {
              Authorization: `Bearer ${session.access_token}`,
            }),
          },
          body: JSON.stringify({
            url: trimmedContent,
            saveToDatabase: !!user,
            quizOptions,
            autoGenerateTitle: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "URL 분석에 실패했습니다.");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "URL 분석에 실패했습니다.");
        }

        // URL에서 추출한 내용을 사용
        contentToProcess = result.sourceInfo.excerpt || "";
        titleToUse =
          result.generatedTitle ||
          result.sourceInfo.originalTitle ||
          "URL 퀴즈";

        // 게스트 사용자만 localStorage에 저장
        if (!user) {
          // URL 분석 결과 저장
          localStorage.setItem(
            `quiz-${slug}`,
            JSON.stringify({
              type: "url",
              url: trimmedContent,
              content: contentToProcess,
              sourceInfo: result.sourceInfo,
            })
          );

          // 이미 퀴즈가 생성되었으므로 저장하고 바로 이동
          if (result.data) {
            localStorage.setItem(
              `quiz-${slug}-data`,
              JSON.stringify(result.data)
            );
          }

          localStorage.setItem(
            `quiz-${slug}-meta`,
            JSON.stringify({
              createdAt,
              title: titleToUse,
              userId: "guest",
              userEmail: null,
              isGuest: true,
              quizOptions,
              sourceUrl: trimmedContent,
              type: "url",
            })
          );
        }

        // URL 모드에서는 이미 API에서 퀴즈 생성이 완료되었으므로 바로 이동
        router.push(`/quiz/${slug}`);
        return;
      } else {
        // 텍스트 모드 처리
        contentToProcess = trimmedContent;
        titleToUse = extractTitle(trimmedContent);

        // 게스트 사용자만 localStorage에 저장
        if (!user) {
          localStorage.setItem(`quiz-${slug}`, trimmedContent);

          // 메타데이터 저장 (텍스트 모드)
          localStorage.setItem(
            `quiz-${slug}-meta`,
            JSON.stringify({
              createdAt,
              title: titleToUse,
              userId: "guest",
              userEmail: null,
              isGuest: true,
              quizOptions,
              type: "text",
            })
          );
        }
      }

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
                content: isUrl ? contentToProcess : trimmedContent,
                title: titleToUse,
                saveToDatabase: true,
                quizOptions,
              }),
            });

            const result = await response.json();

            if (result.success && result.data) {
              // 로그인한 사용자는 localStorage에 저장하지 않음
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

  // 입력된 내용이 URL인지 표시하는 헬퍼 함수
  const getInputStatus = () => {
    if (!content.trim()) return "내용을 입력해주세요";

    const isUrl = isValidUrl(content.trim());
    if (isUrl) {
      return "🔗 URL이 감지되었습니다 - 웹페이지 내용을 추출하여 퀴즈를 생성합니다";
    } else {
      return `📄 텍스트 내용 (${content.length}자) - 입력된 텍스트로 퀴즈를 생성합니다`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto ">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12"></div>

        {/* 퀴즈 생성 옵션 */}
        <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⚙️ 퀴즈 생성 옵션
          </h3>

          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* 문제 유형 선택 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                문제 유형 선택
              </label>
              <div className="flex flex-wrap gap-4">
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
            <div className="flex-shrink-0">
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

        {/* 통합 입력 섹션 */}
        <div className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div>
            <label
              htmlFor="content-input"
              className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4"
            >
              📄 문서 내용 또는 🔗 URL 입력
            </label>
            <textarea
              id="content-input"
              className="w-full h-48 sm:h-64 lg:h-72 border rounded-md p-3 sm:p-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400"
              placeholder={`🔗 웹페이지 URL:
                https://example.com/article
                https://blog.example.com/post/123
                
                또는
                
                📄 텍스트 내용:
                # 인공지능의 개념
                인공지능(AI)은 컴퓨터가 인간의 지능을 모방하여 학습하고 추론하는 기술입니다...
                
                블로그 포스팅이나 기사 내용을 그대로 복사해서 붙여넣어도 됩니다.`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isGenerating}
              tabIndex={0}
              aria-label="문서 내용 또는 URL 입력"
            />

            {/* URL 감지 시 추가 정보 표시 */}
            {content.trim() && isValidUrl(content.trim()) && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">🔗 URL이 감지되었습니다!</span>
                  <br />
                  웹페이지의 본문을 자동으로 추출하여 퀴즈를 생성합니다.
                  로그인이 필요한 페이지나 동적 콘텐츠는 제대로 추출되지 않을 수
                  있습니다.
                </p>
              </div>
            )}
          </div>

          {/* 하단 정보 및 버튼 */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 sm:mt-6 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              {getInputStatus()}
            </div>
            <button
              onClick={handleGenerateQuiz}
              disabled={!content.trim() || isGenerating}
              className={`order-1 sm:order-2 w-full sm:w-auto px-6 py-3 sm:py-2 rounded-md font-medium transition-colors ${
                content.trim() && !isGenerating
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              tabIndex={0}
              aria-label="AI 퀴즈 생성"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  {isValidUrl(content.trim())
                    ? "URL 분석 및 퀴즈 생성 중..."
                    : "퀴즈 생성 중..."}
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

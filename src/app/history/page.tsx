"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useToastHelpers } from "@/hooks/useToast";
import {
  getUserQuizRecords,
  QuizRecord,
  deleteQuizRecord,
} from "@/lib/database";

interface QuizItem {
  id: string;
  content: string;
  createdAt: string;
  title: string;
  tag?: string;
}

export default function HistoryPage() {
  const [quizHistory, setQuizHistory] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useToastHelpers();

  // user가 처음 확정될 때만 실행 (undefined → null 또는 User 객체)
  const prevUserRef = useRef<typeof user | undefined>(undefined);

  useEffect(() => {
    if (prevUserRef.current === undefined && user !== undefined) {
      const loadQuizHistory = async () => {
        try {
          setIsLoading(true);
          let history: QuizItem[] = [];

          if (user) {
            // 로그인한 사용자: 데이터베이스에서 퀴즈 로드
            console.log("🔄 데이터베이스에서 퀴즈 히스토리 로드 중...");
            const { data: dbRecords, error } = await getUserQuizRecords(
              user.id,
              50
            );

            if (!error && dbRecords) {
              history = dbRecords.map((record: QuizRecord) => ({
                id: record.id,
                title: record.title,
                tag: record.tag,
                content: record.original_content,
                createdAt: record.created_at,
              }));
              console.log(
                `✅ 데이터베이스에서 ${history.length}개 퀴즈 로드됨`
              );
            } else {
              console.error("❌ 데이터베이스 로드 실패:", error);
              // 로그인한 사용자는 localStorage 폴백 사용하지 않음
              history = [];
            }
          } else {
            // 게스트 사용자: localStorage에서만 로드 (인라인 처리)
            console.log(
              "🔄 게스트 모드: 로컬스토리지에서 퀴즈 히스토리 로드 중..."
            );

            // localStorage 퀴즈 로드 로직 (인라인)
            const localQuizzes: QuizItem[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (
                key?.startsWith("quiz-") &&
                !key.includes("-meta") &&
                !key.includes("-data")
              ) {
                const content = localStorage.getItem(key);
                if (content) {
                  const id = key.replace("quiz-", "");
                  const metaData = localStorage.getItem(`${key}-meta`);
                  let parsedMeta;
                  try {
                    parsedMeta = metaData ? JSON.parse(metaData) : null;
                  } catch {
                    parsedMeta = null;
                  }

                  // 제목 추출
                  let title = parsedMeta?.title;
                  if (!title) {
                    try {
                      const parsedContent = JSON.parse(content);
                      if (parsedContent.type === "url") {
                        title =
                          parsedContent.sourceInfo?.originalTitle ||
                          parsedContent.url ||
                          "URL 퀴즈";
                      } else {
                        throw new Error("Not URL content");
                      }
                    } catch {
                      const lines = content.split("\n");
                      const titleLine = lines.find((line) =>
                        line.startsWith("# ")
                      );
                      title = titleLine
                        ? titleLine.replace("# ", "").trim()
                        : content.substring(0, 50) +
                          (content.length > 50 ? "..." : "");
                    }
                  }

                  const createdAt =
                    parsedMeta?.createdAt || new Date().toISOString();
                  const tag = parsedMeta?.tag;

                  localQuizzes.push({
                    id,
                    content,
                    createdAt,
                    title,
                    tag,
                  });
                }
              }
            }
            history = localQuizzes;
            console.log(`✅ 로컬스토리지에서 ${history.length}개 퀴즈 로드됨`);
          }

          // 생성일 기준 최신순 정렬
          history.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setQuizHistory(history);
        } catch (error) {
          console.error("히스토리 로드 중 오류:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadQuizHistory();
      prevUserRef.current = user;
    }
  }, [user]); // user가 처음 로드될 때만 실행

  // 히스토리 새로고침 함수 (수동으로 호출할 수 있도록)
  const refreshHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      let history: QuizItem[] = [];

      if (user) {
        // 로그인한 사용자: 데이터베이스에서 퀴즈 로드
        console.log("🔄 데이터베이스에서 퀴즈 히스토리 새로고침 중...");
        const { data: dbRecords, error } = await getUserQuizRecords(
          user.id,
          50
        );

        if (!error && dbRecords) {
          history = dbRecords.map((record: QuizRecord) => ({
            id: record.id,
            title: record.title,
            tag: record.tag,
            content: record.original_content,
            createdAt: record.created_at,
          }));
          console.log(
            `✅ 데이터베이스에서 ${history.length}개 퀴즈 새로고침됨`
          );
        } else {
          console.error("❌ 데이터베이스 새로고침 실패:", error);
          history = [];
        }
      } else {
        // 게스트 사용자: localStorage에서만 로드
        console.log("🔄 게스트 모드: 로컬스토리지 새로고침 중...");

        const localQuizzes: QuizItem[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key?.startsWith("quiz-") &&
            !key.includes("-meta") &&
            !key.includes("-data")
          ) {
            const content = localStorage.getItem(key);
            if (content) {
              const id = key.replace("quiz-", "");
              const metaData = localStorage.getItem(`${key}-meta`);
              let parsedMeta;
              try {
                parsedMeta = metaData ? JSON.parse(metaData) : null;
              } catch {
                parsedMeta = null;
              }

              let title = parsedMeta?.title;
              if (!title) {
                try {
                  const parsedContent = JSON.parse(content);
                  if (parsedContent.type === "url") {
                    title =
                      parsedContent.sourceInfo?.originalTitle ||
                      parsedContent.url ||
                      "URL 퀴즈";
                  } else {
                    throw new Error("Not URL content");
                  }
                } catch {
                  const lines = content.split("\n");
                  const titleLine = lines.find((line) => line.startsWith("# "));
                  title = titleLine
                    ? titleLine.replace("# ", "").trim()
                    : content.substring(0, 50) +
                      (content.length > 50 ? "..." : "");
                }
              }

              const createdAt =
                parsedMeta?.createdAt || new Date().toISOString();
              const tag = parsedMeta?.tag;

              localQuizzes.push({
                id,
                content,
                createdAt,
                title,
                tag,
              });
            }
          }
        }
        history = localQuizzes;
        console.log(`✅ 로컬스토리지에서 ${history.length}개 퀴즈 새로고침됨`);
      }

      // 생성일 기준 최신순 정렬
      history.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setQuizHistory(history);
    } catch (error) {
      console.error("히스토리 새로고침 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleViewQuiz = (id: string) => {
    router.push(`/quiz/${id}`);
  };

  const handleDeleteQuiz = async (id: string) => {
    if (confirm("이 퀴즈를 삭제하시겠습니까?")) {
      try {
        if (user) {
          // 로그인 사용자: 데이터베이스에서만 삭제 (localStorage 사용 안함)
          console.log("🗑️ 데이터베이스에서 퀴즈 삭제 중...", id);
          const { error } = await deleteQuizRecord(id, user.id);
          if (!error) {
            console.log("✅ 데이터베이스에서 퀴즈 삭제 완료");
          } else {
            console.log("❌ 데이터베이스 삭제 실패:", error);
            throw new Error("퀴즈 삭제에 실패했습니다.");
          }
        } else {
          // 게스트 사용자: localStorage에서만 삭제
          console.log("🗑️ 로컬스토리지에서 퀴즈 삭제 중...", id);
          localStorage.removeItem(`quiz-${id}`);
          localStorage.removeItem(`quiz-${id}-meta`);
          localStorage.removeItem(`quiz-${id}-data`);
        }

        // 히스토리 다시 로드
        refreshHistory();
      } catch (error) {
        console.error("퀴즈 삭제 중 오류:", error);
        alert("퀴즈 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleDeleteAll = async () => {
    if (confirm("모든 퀴즈 히스토리를 삭제하시겠습니까?")) {
      try {
        if (user) {
          // 로그인 사용자: 데이터베이스 퀴즈들을 개별 삭제
          console.log("🗑️ 데이터베이스에서 모든 퀴즈 삭제 중...");
          const deletePromises = quizHistory.map(async (item) => {
            const { error } = await deleteQuizRecord(item.id, user.id);
            if (error) {
              console.log(`❌ 퀴즈 ${item.id} 삭제 실패:`, error);
            }
          });
          await Promise.all(deletePromises);
          console.log("✅ 데이터베이스 퀴즈 삭제 완료");
        } else {
          // 게스트 사용자: localStorage만 정리
          console.log("🗑️ 로컬스토리지에서 모든 퀴즈 삭제 중...");
          quizHistory.forEach((item) => {
            localStorage.removeItem(`quiz-${item.id}`);
            localStorage.removeItem(`quiz-${item.id}-meta`);
            localStorage.removeItem(`quiz-${item.id}-data`);
          });
        }

        setQuizHistory([]);
      } catch (error) {
        console.error("전체 삭제 중 오류:", error);
        alert("퀴즈 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 태그 스타일 함수
  const getTagStyle = (tag?: string) => {
    if (!tag) return "";

    const tagStyles: { [key: string]: string } = {
      상식: "bg-green-100 text-green-800",
      기술: "bg-blue-100 text-blue-800",
      건강: "bg-pink-100 text-pink-800",
      교육: "bg-purple-100 text-purple-800",
      생활: "bg-yellow-100 text-yellow-800",
      경제: "bg-red-100 text-red-800",
      과학: "bg-indigo-100 text-indigo-800",
      역사: "bg-orange-100 text-orange-800",
      문화: "bg-teal-100 text-teal-800",
    };

    return tagStyles[tag] || "bg-gray-100 text-gray-800";
  };

  const handleShareQuiz = async (quiz: QuizItem) => {
    try {
      const quizUrl = `${window.location.origin}/quiz/${quiz.id}`;
      console.log("🔗 공유하기 클릭됨:", quizUrl);

      // 클립보드에 URL 복사
      await navigator.clipboard.writeText(quizUrl);
      console.log("✅ 클립보드 복사 성공");

      showSuccess("링크 복사 완료", "퀴즈 링크가 클립보드에 복사되었습니다!");
      console.log("📢 Toast 알림 호출됨");
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      showError(
        "복사 실패",
        "링크 복사에 실패했습니다. 브라우저에서 링크를 수동으로 복사해주세요."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12">
        {/* 헤더 섹션 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 sm:mb-10 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            📊 퀴즈 히스토리
          </h1>
          {quizHistory.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="w-full sm:w-auto px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              tabIndex={0}
              aria-label="모든 히스토리 삭제"
            >
              전체 삭제
            </button>
          )}
        </div>

        {/* 간단한 히스토리 정보 */}
        <div className="mb-6 text-gray-600">
          <p>
            {user ? (
              <>
                <span className="font-medium">클라우드</span> 퀴즈
              </>
            ) : (
              <>
                <span className="font-medium">로컬</span> 퀴즈
              </>
            )}
            총 {quizHistory.length}개
          </p>
        </div>

        {quizHistory.length === 0 ? (
          /* 빈 상태 */
          <div className="text-center py-16 sm:py-20">
            <div className="text-6xl sm:text-7xl mb-4">📝</div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-3">
              아직 생성된 퀴즈가 없습니다
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto">
              마크다운 문서를 제출하여 첫 번째 퀴즈를 만들어보세요!
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              tabIndex={0}
              aria-label="퀴즈 만들기 페이지로 이동"
            >
              퀴즈 만들기 →
            </button>
          </div>
        ) : (
          /* 퀴즈 목록 */
          <div className="space-y-4 sm:space-y-6">
            {quizHistory.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col space-y-4">
                  {/* 퀴즈 정보 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {quiz.title}
                        </h3>
                        {quiz.tag && (
                          <span
                            className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getTagStyle(
                              quiz.tag
                            )}`}
                          >
                            📂 {quiz.tag}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">
                        📅 생성일: {formatDate(quiz.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">
                        📄 원본 문서 미리보기:
                      </p>
                    </div>

                    <div className="text-gray-600 text-sm">
                      <div className="bg-gray-50 p-4 rounded-lg border text-sm leading-relaxed overflow-hidden">
                        <div className="font-mono text-xs text-gray-500 mb-2">
                          {quiz.content.substring(0, 200)}
                          {quiz.content.length > 200 && "..."}
                        </div>
                        <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-200">
                          총 {quiz.content.length}자 · 이 문서로 퀴즈가
                          생성되었습니다
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleViewQuiz(quiz.id)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
                      tabIndex={0}
                      aria-label={`${quiz.title} 퀴즈 보기`}
                    >
                      퀴즈 보기
                    </button>
                    <button
                      onClick={() => handleShareQuiz(quiz)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base flex items-center justify-center gap-2"
                      tabIndex={0}
                      aria-label={`${quiz.title} 퀴즈 공유`}
                    >
                      <span>🔗</span>
                      공유
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm sm:text-base"
                      tabIndex={0}
                      aria-label={`${quiz.title} 퀴즈 삭제`}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

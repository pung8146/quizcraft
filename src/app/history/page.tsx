"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface QuizItem {
  id: string;
  content: string;
  createdAt: string;
  title: string;
}

export default function HistoryPage() {
  const [quizHistory, setQuizHistory] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadQuizHistory();
  }, []);

  const loadQuizHistory = () => {
    try {
      const history: QuizItem[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("quiz-")) {
          const content = localStorage.getItem(key);
          if (content) {
            const id = key.replace("quiz-", "");
            const title = extractTitle(content);
            const createdAt = getCreatedDate(key);

            history.push({
              id,
              content,
              createdAt,
              title,
            });
          }
        }
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

  const extractTitle = (content: string): string => {
    const lines = content.split("\n");
    const titleLine = lines.find((line) => line.startsWith("# "));
    if (titleLine) {
      return titleLine.replace("# ", "").trim();
    }
    return content.substring(0, 50) + (content.length > 50 ? "..." : "");
  };

  const getCreatedDate = (key: string): string => {
    // localStorage에는 생성일이 없으므로 현재 시간을 사용
    // 실제 프로젝트에서는 별도의 메타데이터 저장이 필요
    const saved = localStorage.getItem(`${key}-meta`);
    if (saved) {
      try {
        const meta = JSON.parse(saved);
        return meta.createdAt;
      } catch {
        // 메타데이터가 없거나 파싱 실패시 현재 시간 사용
      }
    }

    // 기본값으로 현재 시간 저장
    const now = new Date().toISOString();
    localStorage.setItem(`${key}-meta`, JSON.stringify({ createdAt: now }));
    return now;
  };

  const handleViewQuiz = (id: string) => {
    router.push(`/quiz/${id}`);
  };

  const handleDeleteQuiz = (id: string) => {
    if (confirm("이 퀴즈를 삭제하시겠습니까?")) {
      localStorage.removeItem(`quiz-${id}`);
      localStorage.removeItem(`quiz-${id}-meta`);
      loadQuizHistory();
    }
  };

  const handleDeleteAll = () => {
    if (confirm("모든 퀴즈 히스토리를 삭제하시겠습니까?")) {
      quizHistory.forEach((item) => {
        localStorage.removeItem(`quiz-${item.id}`);
        localStorage.removeItem(`quiz-${item.id}-meta`);
      });
      setQuizHistory([]);
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

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📊 퀴즈 히스토리</h1>
        {quizHistory.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            tabIndex={0}
            aria-label="모든 히스토리 삭제"
          >
            전체 삭제
          </button>
        )}
      </div>

      {quizHistory.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            아직 생성된 퀴즈가 없습니다
          </h2>
          <p className="text-gray-500 mb-6">
            마크다운 문서를 제출하여 첫 번째 퀴즈를 만들어보세요!
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            tabIndex={0}
            aria-label="문서 제출 페이지로 이동"
          >
            문서 제출하기 →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {quizHistory.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    생성일: {formatDate(quiz.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">ID: {quiz.id}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewQuiz(quiz.id)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    tabIndex={0}
                    aria-label={`${quiz.title} 퀴즈 보기`}
                  >
                    퀴즈 보기
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    tabIndex={0}
                    aria-label={`${quiz.title} 퀴즈 삭제`}
                  >
                    삭제
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {quiz.content.substring(0, 200)}
                  {quiz.content.length > 200 && "..."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

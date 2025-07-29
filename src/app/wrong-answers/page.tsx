"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface WrongAnswer {
  id: string;
  quiz_record_id: string;
  quiz_title: string;
  question_index: number;
  question_type: string;
  question_text: string;
  user_answer: string | number | boolean;
  correct_answer: string | number | boolean;
  explanation?: string;
  created_at: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
}

export default function WrongAnswersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadWrongAnswers();
  }, [user]);

  const loadWrongAnswers = async (page: number = 1) => {
    try {
      setIsLoading(true);

      if (user) {
        // 로그인한 사용자: 데이터베이스에서 로드
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError("인증이 필요합니다.");
          return;
        }

        const response = await fetch(
          `/api/wrong-answers?page=${page}&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          setWrongAnswers(result.data.wrongAnswers);
          setPagination(result.data.pagination);
        } else {
          setError(result.error || "틀린 문제를 불러오는데 실패했습니다.");
        }
      } else {
        // 게스트 사용자: localStorage에서 로드
        const storedWrongAnswers = JSON.parse(
          localStorage.getItem("wrong-answers") || "[]"
        );

        // 페이지네이션 처리
        const limit = 20;
        const offset = (page - 1) * limit;
        const paginatedAnswers = storedWrongAnswers.slice(
          offset,
          offset + limit
        );
        const totalRecords = storedWrongAnswers.length;
        const totalPages = Math.ceil(totalRecords / limit);

        setWrongAnswers(paginatedAnswers);
        setPagination({
          currentPage: page,
          totalPages,
          totalRecords,
          limit,
        });
      }
    } catch (error) {
      console.error("틀린 문제 로드 오류:", error);
      setError("틀린 문제를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    loadWrongAnswers(page);
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

  const formatAnswer = (answer: string | number | boolean): string => {
    if (typeof answer === "boolean") {
      return answer ? "참 (True)" : "거짓 (False)";
    }
    return String(answer);
  };

  const formatQuestionType = (type: string): string => {
    switch (type) {
      case "multiple-choice":
        return "객관식";
      case "true-false":
        return "참/거짓";
      case "fill-in-the-blank":
        return "빈칸 채우기";
      default:
        return type;
    }
  };

  // 게스트 사용자도 오답 노트를 볼 수 있도록 수정
  // if (!user) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="text-6xl mb-4">📝</div>
  //         <h2 className="text-2xl font-bold text-gray-900 mb-4">
  //           게스트 오답 노트
  //         </h2>
  //         <p className="text-gray-600 mb-6">
  //           로컬에 저장된 틀린 문제들을 확인할 수 있습니다.
  //         </p>
  //         <button
  //           onClick={() => router.push("/login")}
  //           className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  //         >
  //           로그인하여 클라우드에 저장하기
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">오답 노트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📝 오답 노트
              </h1>
              <p className="text-gray-600">
                틀린 문제들을 다시 한번 복습해보세요
              </p>
            </div>
          </div>

          {wrongAnswers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                아직 틀린 문제가 없습니다!
              </h2>
              <p className="text-gray-600 mb-6">
                퀴즈를 풀어보시고 틀린 문제들이 여기에 모입니다.
              </p>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                퀴즈 풀러 가기
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    총 {pagination?.totalRecords || 0}개의 틀린 문제
                  </p>
                  <p className="text-sm text-gray-500">
                    페이지 {pagination?.currentPage || 1} /{" "}
                    {pagination?.totalPages || 1}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {wrongAnswers.map((wrongAnswer) => (
                  <div
                    key={wrongAnswer.id}
                    className="border border-red-200 rounded-lg p-6 bg-red-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-red-500 text-2xl mr-3">❌</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {wrongAnswer.quiz_title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            문제 {wrongAnswer.question_index + 1} •{" "}
                            {formatQuestionType(wrongAnswer.question_type)} •{" "}
                            {formatDate(wrongAnswer.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">문제</h4>
                        <p className="text-gray-700 bg-white p-3 rounded border">
                          {wrongAnswer.question_text}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-red-600 mb-2">
                            내 답안
                          </h4>
                          <p className="text-red-700 bg-red-100 p-3 rounded border border-red-200">
                            {formatAnswer(wrongAnswer.user_answer)}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-600 mb-2">
                            정답
                          </h4>
                          <p className="text-green-700 bg-green-100 p-3 rounded border border-green-200">
                            {formatAnswer(wrongAnswer.correct_answer)}
                          </p>
                        </div>
                      </div>

                      {wrongAnswer.explanation && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            💡 설명
                          </h4>
                          <p className="text-gray-700 bg-blue-50 p-3 rounded border border-blue-200">
                            {wrongAnswer.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 페이지네이션 */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                      {pagination.currentPage} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

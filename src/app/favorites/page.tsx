"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useToastHelpers } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import { QuizRecord } from "@/lib/database";

interface QuizItem {
  id: string;
  title: string;
  tag?: string;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showError, showSuccess } = useToastHelpers();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRemovingFavorite, setIsRemovingFavorite] = useState<string | null>(
    null
  );
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  const loadFavorites = useCallback(
    async (page: number = 1) => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError("");

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError("인증이 필요합니다.");
          return;
        }

        const response = await fetch(`/api/favorites?page=${page}&limit=10`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "즐겨찾기 목록을 불러올 수 없습니다."
          );
        }

        if (result.success && result.data) {
          const quizItems: QuizItem[] = result.data.records.map(
            (record: QuizRecord) => ({
              id: record.id,
              title: record.title,
              tag: record.tag,
              createdAt: record.created_at,
            })
          );

          setQuizzes(quizItems);
          setPagination(result.data.pagination);
          setCurrentPage(page);
        }
      } catch (error) {
        console.error("즐겨찾기 로드 오류:", error);
        setError(
          error instanceof Error
            ? error.message
            : "즐겨찾기 목록을 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setIsLoading(false);
      setError("로그인이 필요합니다.");
    }
  }, [user, loadFavorites]);

  // 무한 스크롤 설정
  useEffect(() => {
    if (!pagination?.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadFavorites(currentPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [pagination, isLoading, currentPage, loadFavorites]);

  const handleQuizClick = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  const handleRemoveFavorite = async (quizId: string) => {
    if (!user) return;

    try {
      setIsRemovingFavorite(quizId);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        showError("인증 오류", "인증이 필요합니다.");
        return;
      }

      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ quizId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "즐겨찾기 제거에 실패했습니다.");
      }

      if (result.success) {
        showSuccess("즐겨찾기 제거", "즐겨찾기에서 제거되었습니다.");
        // 목록에서 제거
        setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
        // 페이지네이션 업데이트
        if (pagination) {
          setPagination((prev) =>
            prev
              ? {
                  ...prev,
                  totalCount: prev.totalCount - 1,
                  totalPages: Math.ceil((prev.totalCount - 1) / 10),
                  hasNextPage:
                    prev.currentPage < Math.ceil((prev.totalCount - 1) / 10),
                }
              : null
          );
        }
      }
    } catch (error) {
      console.error("즐겨찾기 제거 오류:", error);
      showError(
        "즐겨찾기 제거 오류",
        error instanceof Error
          ? error.message
          : "즐겨찾기 제거 중 오류가 발생했습니다."
      );
    } finally {
      setIsRemovingFavorite(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">즐겨찾기</h1>
            <p className="text-gray-600">로그인이 필요합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">즐겨찾기</h1>
          <p className="text-gray-600">
            즐겨찾기한 퀴즈들을 확인하고 관리할 수 있습니다.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {isLoading && quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">즐겨찾기를 불러오는 중...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              즐겨찾기한 퀴즈가 없습니다
            </h3>
            <p className="text-gray-600 mb-6">
              퀴즈를 즐겨찾기에 추가하면 여기서 확인할 수 있습니다.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              퀴즈 만들기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleQuizClick(quiz.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {quiz.title}
                    </h3>
                    {quiz.tag && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mt-2">
                        {quiz.tag}
                      </span>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {formatDate(quiz.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(quiz.id);
                      }}
                      disabled={isRemovingFavorite === quiz.id}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                      title="즐겨찾기에서 제거"
                    >
                      {isRemovingFavorite === quiz.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* 무한 스크롤 로딩 인디케이터 */}
            {pagination?.hasNextPage && (
              <div ref={loadingRef} className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">
                  더 많은 즐겨찾기를 불러오는 중...
                </p>
              </div>
            )}

            {/* 페이지네이션 정보 */}
            {pagination && (
              <div className="text-center text-sm text-gray-500 mt-6">
                총 {pagination.totalCount}개의 즐겨찾기
                {pagination.totalPages > 1 && (
                  <span className="ml-2">
                    (페이지 {pagination.currentPage} / {pagination.totalPages})
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

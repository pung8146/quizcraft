"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GeneratedQuiz } from "@/lib/openai";

interface Profile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface PublicQuiz {
  id: string;
  title: string;
  tag?: string;
  created_at: string;
  generated_quiz: GeneratedQuiz;
  profiles: Profile;
}

interface QuizListResponse {
  success: boolean;
  data: {
    quizzes: PublicQuiz[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      limit: number;
    };
    availableTags: string[];
  };
  error?: string;
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const fetchQuizzes = async (page: number = 1, tag: string = "all", search: string = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      });

      if (tag !== "all") {
        params.append("tag", tag);
      }

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const response = await fetch(`/api/public-quizzes?${params}`);
      const data: QuizListResponse = await response.json();

      if (data.success) {
        setQuizzes(data.data.quizzes);
        setCurrentPage(data.data.pagination.currentPage);
        setTotalPages(data.data.pagination.totalPages);
        setAvailableTags(data.data.availableTags);
        setError(null);
      } else {
        setError(data.error || "퀴즈 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("퀴즈 목록 조회 오류:", error);
      setError("퀴즈 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes(1, selectedTag, searchTerm);
  }, [selectedTag]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuizzes(1, selectedTag, searchTerm);
  };

  const handlePageChange = (page: number) => {
    fetchQuizzes(page, selectedTag, searchTerm);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getQuestionCount = (quiz: GeneratedQuiz) => {
    return quiz.questions?.length || 0;
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">퀴즈 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 text-lg">{error}</div>
            <button
              onClick={() => fetchQuizzes(1, selectedTag, searchTerm)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">퀴즈 목록</h1>
          <p className="text-gray-600">다른 사용자들이 만든 퀴즈를 풀어보세요!</p>
        </div>

        {/* 필터 및 검색 */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 태그 필터 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* 검색 */}
            <div className="flex-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="퀴즈 제목으로 검색..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  검색
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 퀴즈 그리드 */}
        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">퀴즈가 없습니다.</div>
            <p className="text-gray-400 mt-2">다른 검색 조건을 시도해보세요.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                >
                  <div className="p-6">
                    {/* 태그 */}
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {quiz.tag || "기타"}
                      </span>
                    </div>

                    {/* 제목 */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {quiz.title}
                    </h3>

                    {/* 문제 수 */}
                    <p className="text-sm text-gray-600 mb-3">
                      문제 수: {getQuestionCount(quiz.generated_quiz)}개
                    </p>

                    {/* 작성자 정보 */}
                    <div className="flex items-center mb-4">
                      {quiz.profiles.avatar_url ? (
                        <img
                          src={quiz.profiles.avatar_url}
                          alt="작성자"
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded-full mr-2 flex items-center justify-center">
                          <span className="text-xs text-gray-600">
                            {(quiz.profiles.name || quiz.profiles.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-gray-600">
                        {quiz.profiles.name || quiz.profiles.email}
                      </span>
                    </div>

                    {/* 날짜 */}
                    <p className="text-xs text-gray-500 mb-4">
                      {formatDate(quiz.created_at)}
                    </p>

                    {/* 퀴즈 풀기 버튼 */}
                    <Link
                      href={`/quiz/${quiz.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      퀴즈 풀기
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
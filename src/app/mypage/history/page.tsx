'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
        if (key?.startsWith('quiz-')) {
          const content = localStorage.getItem(key);
          if (content) {
            const id = key.replace('quiz-', '');
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
      console.error('히스토리 로드 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractTitle = (content: string): string => {
    const lines = content.split('\n');
    const titleLine = lines.find((line) => line.startsWith('# '));
    if (titleLine) {
      return titleLine.replace('# ', '').trim();
    }
    return content.substring(0, 50) + (content.length > 50 ? '...' : '');
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
    if (confirm('이 퀴즈를 삭제하시겠습니까?')) {
      localStorage.removeItem(`quiz-${id}`);
      localStorage.removeItem(`quiz-${id}-meta`);
      loadQuizHistory();
    }
  };

  const handleDeleteAll = () => {
    if (confirm('모든 퀴즈 히스토리를 삭제하시겠습니까?')) {
      quizHistory.forEach((item) => {
        localStorage.removeItem(`quiz-${item.id}`);
        localStorage.removeItem(`quiz-${item.id}-meta`);
      });
      setQuizHistory([]);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        {/* 브레드크럼 네비게이션 */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push('/mypage')}
                className="text-gray-500 hover:text-blue-600 text-sm"
              >
                마이페이지
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-3 h-3 text-gray-400 mx-1"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  히스토리
                </span>
              </div>
            </li>
          </ol>
        </nav>

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
              onClick={() => router.push('/')}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              tabIndex={0}
              aria-label="문서 제출 페이지로 이동"
            >
              문서 제출하기 →
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-4 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 break-words">
                      {quiz.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>생성일: {formatDate(quiz.createdAt)}</p>
                      <p className="font-mono text-xs">ID: {quiz.id}</p>
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:ml-4">
                    <button
                      onClick={() => handleViewQuiz(quiz.id)}
                      className="w-full sm:w-auto px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                      tabIndex={0}
                      aria-label={`${quiz.title} 퀴즈 보기`}
                    >
                      퀴즈 보기
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz.id)}
                      className="w-full sm:w-auto px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      tabIndex={0}
                      aria-label={`${quiz.title} 퀴즈 삭제`}
                    >
                      삭제
                    </button>
                  </div>
                </div>

                {/* 콘텐츠 미리보기 */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-sm sm:text-base text-gray-600 line-clamp-3 break-words">
                    {quiz.content.substring(0, 200)}
                    {quiz.content.length > 200 && '...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

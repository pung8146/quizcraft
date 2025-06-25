'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function HomePage() {
  const [markdown, setMarkdown] = useState('');
  const router = useRouter();

  const handleGenerateQuiz = () => {
    if (!markdown.trim()) return alert('텍스트를 입력해주세요.');

    const slug = nanoid(8); // 랜덤 ID 생성
    const createdAt = new Date().toISOString();

    // 텍스트 내용 저장
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
    const lines = content.split('\n');
    const titleLine = lines.find((line) => line.startsWith('# '));
    if (titleLine) {
      return titleLine.replace('# ', '').trim();
    }
    return content.substring(0, 50) + (content.length > 50 ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:py-8 lg:py-12">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
            🤖 AI 퀴즈 생성기
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-4">
            어떤 텍스트든 붙여넣으면 AI가 자동으로 <strong>요약</strong>하고{' '}
            <strong>다양한 퀴즈</strong>를 만들어드립니다.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm text-gray-500">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              📝 객관식
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              ✅ O/X 문제
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              🔤 빈칸 추론
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              📊 자동 요약
            </span>
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
            tabIndex={0}
            aria-label="문서 내용 입력"
          />

          {/* 하단 정보 및 버튼 */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 sm:mt-6 space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-500 order-2 sm:order-1">
              {markdown.length > 0
                ? `${markdown.length}자 입력됨`
                : '텍스트를 입력해주세요'}
            </div>
            <button
              onClick={handleGenerateQuiz}
              disabled={!markdown.trim()}
              className={`order-1 sm:order-2 w-full sm:w-auto px-6 py-3 sm:py-2 rounded-md font-medium transition-colors ${
                markdown.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              tabIndex={0}
              aria-label="AI 퀴즈 생성"
            >
              🤖 AI 퀴즈 생성하기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

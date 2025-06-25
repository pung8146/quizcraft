"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GeneratedQuiz, QuizQuestion } from "@/lib/openai";
import { supabase } from "@/lib/supabase";

interface QuizAnswer {
  questionIndex: number;
  answer: string | number | boolean;
  isCorrect?: boolean;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [quizData, setQuizData] = useState<GeneratedQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  useEffect(() => {
    loadQuizContent();
  }, [slug]);

  const extractTitleFromContent = (content: string): string => {
    const lines = content.split("\n");
    const titleLine = lines.find((line) => line.startsWith("# "));
    if (titleLine) {
      return titleLine.replace("# ", "").trim();
    }
    return content.substring(0, 50) + (content.length > 50 ? "..." : "");
  };

  const loadQuizContent = async () => {
    try {
      const content = localStorage.getItem(`quiz-${slug}`);
      if (!content) {
        setError("퀴즈를 찾을 수 없습니다.");
        return;
      }

      // 기존에 생성된 퀴즈가 있는지 확인
      const existingQuiz = localStorage.getItem(`quiz-${slug}-data`);
      if (existingQuiz) {
        try {
          const parsedQuiz = JSON.parse(existingQuiz) as GeneratedQuiz;
          setQuizData(parsedQuiz);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("기존 퀴즈 데이터 파싱 오류:", error);
        }
      }

      // 새로운 퀴즈 생성
      await generateNewQuiz(content);
    } catch (error) {
      console.error("퀴즈 로드 오류:", error);
      setError("퀴즈를 로드하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewQuiz = async (content: string) => {
    setIsGeneratingQuiz(true);
    try {
      // 메타데이터에서 퀴즈 옵션 가져오기
      const metaData = localStorage.getItem(`quiz-${slug}-meta`);
      let quizOptions = null;
      if (metaData) {
        try {
          const parsedMeta = JSON.parse(metaData);
          quizOptions = parsedMeta.quizOptions;
        } catch (error) {
          console.warn("메타데이터 파싱 오류:", error);
        }
      }

      // 현재 사용자 세션 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // 로그인한 사용자인 경우 Authorization 헤더 추가
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers,
        body: JSON.stringify({
          content,
          title: extractTitleFromContent(content),
          saveToDatabase: !!session?.user, // 로그인한 경우에만 저장
          quizOptions, // 퀴즈 옵션 추가
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "퀴즈 생성에 실패했습니다.");
      }

      if (result.success && result.data) {
        setQuizData(result.data);
        // 생성된 퀴즈 저장
        localStorage.setItem(`quiz-${slug}-data`, JSON.stringify(result.data));

        // 데이터베이스 저장 결과 로깅
        if (result.savedRecord) {
          console.log(
            "✅ 퀴즈가 데이터베이스에 성공적으로 저장되었습니다:",
            result.savedRecord.id
          );
        } else {
          console.log(
            "ℹ️ 퀴즈는 생성되었지만 데이터베이스에 저장되지 않았습니다."
          );
        }
      } else {
        throw new Error("퀴즈 데이터가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("퀴즈 생성 오류:", error);
      setError(
        error instanceof Error
          ? error.message
          : "퀴즈 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleAnswer = (answer: string | number | boolean) => {
    if (!quizData) return;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    const newAnswer: QuizAnswer = {
      questionIndex: currentQuestionIndex,
      answer,
      isCorrect,
    };

    setUserAnswers((prev) => {
      const updated = [...prev];
      const existingIndex = updated.findIndex(
        (a) => a.questionIndex === currentQuestionIndex
      );
      if (existingIndex >= 0) {
        updated[existingIndex] = newAnswer;
      } else {
        updated.push(newAnswer);
      }
      return updated;
    });
  };

  const nextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const userAnswer = userAnswers.find((a) => a.questionIndex === index);

    switch (question.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {question.question}
            </h3>
            <div className="space-y-3">
              {question.options?.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => handleAnswer(optionIndex)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    userAnswer?.answer === optionIndex
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {optionIndex + 1}. {option}
                </button>
              ))}
            </div>
          </div>
        );

      case "true-false":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {question.question}
            </h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleAnswer(true)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  userAnswer?.answer === true
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                참 (True)
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                  userAnswer?.answer === false
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                거짓 (False)
              </button>
            </div>
          </div>
        );

      case "fill-in-the-blank":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {question.question}
            </h3>
            <input
              type="text"
              value={(userAnswer?.answer as string) || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="답을 입력해주세요..."
            />
          </div>
        );

      default:
        return null;
    }
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    const correctAnswers = userAnswers.filter(
      (answer) => answer.isCorrect
    ).length;
    return Math.round((correctAnswers / quizData.questions.length) * 100);
  };

  if (isLoading || isGeneratingQuiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isGeneratingQuiz
              ? "AI가 퀴즈를 생성하고 있습니다..."
              : "로딩 중..."}
          </p>
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

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">퀴즈 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-center mb-8">퀴즈 결과</h1>

            <div className="text-center mb-8">
              <div
                className={`text-6xl font-bold mb-4 ${
                  score >= 80
                    ? "text-green-600"
                    : score >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {score}점
              </div>
              <p className="text-gray-600">
                총 {quizData.questions.length}문제 중{" "}
                {userAnswers.filter((a) => a.isCorrect).length}문제 정답
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {quizData.questions.map((question, index) => {
                const userAnswer = userAnswers.find(
                  (a) => a.questionIndex === index
                );
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <span
                        className={`text-2xl mr-2 ${
                          userAnswer?.isCorrect ? "✅" : "❌"
                        }`}
                      ></span>
                      <span className="font-semibold">문제 {index + 1}</span>
                    </div>
                    <p className="mb-2">{question.question}</p>
                    {question.explanation && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        💡 {question.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                다시 풀기
              </button>
              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                새 퀴즈 만들기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const hasAnswered = userAnswers.some(
    (a) => a.questionIndex === currentQuestionIndex
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 요약 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">📝 내용 요약</h2>
          <p className="text-gray-700 mb-4">{quizData.summary}</p>

          <h3 className="text-lg font-semibold mb-3">🔑 핵심 포인트</h3>
          <ul className="list-disc list-inside space-y-2">
            {quizData.keyPoints.map((point, index) => (
              <li key={index} className="text-gray-700">
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* 퀴즈 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">📘 퀴즈</h1>
            <span className="text-sm text-gray-500">
              {currentQuestionIndex + 1} / {quizData.questions.length}
            </span>
          </div>

          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / quizData.questions.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {renderQuestion(currentQuestion, currentQuestionIndex)}

          <div className="flex justify-between mt-8">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전 문제
            </button>

            <button
              onClick={nextQuestion}
              disabled={!hasAnswered}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === quizData.questions.length - 1
                ? "결과 보기"
                : "다음 문제"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

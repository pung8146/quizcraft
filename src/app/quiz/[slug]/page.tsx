"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GeneratedQuiz, QuizQuestion } from "@/lib/openai";
import { supabase } from "@/lib/supabase";
import { getQuizRecord } from "@/lib/database";
import { useAuth } from "@/components/AuthProvider";
import { useToastHelpers } from "@/hooks/useToast";

interface QuizAnswer {
  questionIndex: number;
  answer: string | number | boolean;
  isCorrect?: boolean;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [quizData, setQuizData] = useState<GeneratedQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [hasSavedWrongAnswers, setHasSavedWrongAnswers] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isKeyPointsOpen, setIsKeyPointsOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const { showSuccess, showError } = useToastHelpers();

  useEffect(() => {
    loadQuizContent();
  }, [slug]);

  // 즐겨찾기 상태 확인
  useEffect(() => {
    if (user && slug) {
      checkFavoriteStatus();
    }
  }, [user, slug]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) return;

      const response = await fetch(`/api/favorites?quizId=${slug}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsFavorite(result.isFavorite);
      }
    } catch (error) {
      console.error("즐겨찾기 상태 확인 오류:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      showError(
        "로그인 필요",
        "즐겨찾기 기능을 사용하려면 로그인이 필요합니다."
      );
      return;
    }

    try {
      setIsTogglingFavorite(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        showError("인증 오류", "인증이 필요합니다.");
        return;
      }

      const method = isFavorite ? "DELETE" : "POST";
      const response = await fetch("/api/favorites", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ quizId: slug }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "즐겨찾기 토글에 실패했습니다.");
      }

      if (result.success) {
        setIsFavorite(!isFavorite);
        showSuccess(
          isFavorite ? "즐겨찾기 제거" : "즐겨찾기 추가",
          isFavorite
            ? "즐겨찾기에서 제거되었습니다."
            : "즐겨찾기에 추가되었습니다."
        );
      }
    } catch (error) {
      console.error("즐겨찾기 토글 오류:", error);
      showError(
        "즐겨찾기 오류",
        error instanceof Error
          ? error.message
          : "즐겨찾기 처리 중 오류가 발생했습니다."
      );
    } finally {
      setIsTogglingFavorite(false);
    }
  };

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
      if (user) {
        // 로그인한 사용자: 데이터베이스에서만 퀴즈 로드 (localStorage 사용 안함)
        console.log("🔍 데이터베이스에서 퀴즈 검색 중...", slug);
        const { data: dbQuiz, error: dbError } = await getQuizRecord(
          slug,
          user.id
        );

        if (!dbError && dbQuiz) {
          console.log("✅ 데이터베이스에서 퀴즈 발견:", dbQuiz.title);
          setQuizData(dbQuiz.generated_quiz);
          setIsLoading(false);
          return;
        } else {
          console.log("❌ 데이터베이스에서 퀴즈를 찾을 수 없음:", dbError);
          // UUID 형식이 아닌 경우 다른 방법으로 시도
          if (
            dbError &&
            dbError.includes("invalid input syntax for type uuid")
          ) {
            console.log("⚠️ UUID 형식이 아닌 ID, 다른 방법으로 조회 시도...");
            // 여기서 다른 조회 방법을 시도할 수 있습니다
          }
          setError(
            "퀴즈를 찾을 수 없습니다. 삭제되었거나 존재하지 않을 수 있습니다."
          );
        }
      } else {
        // 게스트 사용자: localStorage에서만 퀴즈 로드
        console.log("🔍 게스트 모드: localStorage에서 퀴즈 검색 중...", slug);

        // 1. 기존에 생성된 퀴즈가 있는지 확인
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

        // 2. localStorage에서 원본 내용 확인하여 새로운 퀴즈 생성
        const content = localStorage.getItem(`quiz-${slug}`);
        if (content) {
          await generateNewQuiz(content);
          return;
        }

        // 3. 어디에서도 찾을 수 없으면 오류 표시
        setError(
          "퀴즈를 찾을 수 없습니다. 삭제되었거나 존재하지 않을 수 있습니다."
        );
      }
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

      case "sentence-completion":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {question.question}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                주어진 단어들을 클릭하여 문장을 만들어주세요:
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {question.options?.map((word, wordIndex) => {
                  const currentAnswer = (userAnswer?.answer as string) || "";
                  const isSelected = currentAnswer.includes(word);

                  return (
                    <button
                      key={wordIndex}
                      onClick={() => {
                        const currentAnswer =
                          (userAnswer?.answer as string) || "";
                        if (isSelected) {
                          // 이미 선택된 단어라면 제거
                          const newAnswer = currentAnswer
                            .split(" ")
                            .filter((w) => w !== word)
                            .join(" ");
                          handleAnswer(newAnswer);
                        } else {
                          // 선택되지 않은 단어라면 추가
                          const newAnswer = currentAnswer
                            ? `${currentAnswer} ${word}`
                            : word;
                          handleAnswer(newAnswer);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={(userAnswer?.answer as string) || ""}
                onChange={(e) => handleAnswer(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="단어들을 클릭하거나 직접 입력하여 문장을 만들어주세요..."
              />
              {(userAnswer?.answer as string) && (
                <button
                  onClick={() => handleAnswer("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="입력 내용 지우기"
                >
                  ✕
                </button>
              )}
            </div>
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

  // 사용자 답안을 표시하는 함수
  const renderUserAnswer = (
    question: QuizQuestion,
    userAnswer: string | number | boolean | undefined
  ) => {
    if (userAnswer === undefined) return "답안 없음";

    switch (question.type) {
      case "multiple-choice":
        if (typeof userAnswer === "number" && question.options) {
          return `${userAnswer + 1}. ${question.options[userAnswer]}`;
        }
        return String(userAnswer);
      case "true-false":
        return userAnswer ? "참 (True)" : "거짓 (False)";
      case "fill-in-the-blank":
        return String(userAnswer);
      case "sentence-completion":
        return String(userAnswer);
      default:
        return String(userAnswer);
    }
  };

  // 정답을 표시하는 함수
  const renderCorrectAnswer = (question: QuizQuestion) => {
    switch (question.type) {
      case "multiple-choice":
        if (typeof question.correctAnswer === "number" && question.options) {
          return `${question.correctAnswer + 1}. ${
            question.options[question.correctAnswer]
          }`;
        }
        return String(question.correctAnswer);
      case "true-false":
        return question.correctAnswer ? "참 (True)" : "거짓 (False)";
      case "fill-in-the-blank":
        return String(question.correctAnswer);
      case "sentence-completion":
        return String(question.correctAnswer);
      default:
        return String(question.correctAnswer);
    }
  };

  const saveWrongAnswers = async () => {
    if (!quizData) return;

    try {
      // 틀린 문제들만 필터링
      const wrongAnswers = userAnswers
        .filter((answer) => !answer.isCorrect)
        .map((answer) => {
          const question = quizData.questions[answer.questionIndex];
          return {
            questionIndex: answer.questionIndex,
            questionType: question.type,
            questionText: question.question,
            userAnswer: answer.answer,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
          };
        });

      if (wrongAnswers.length === 0) return;

      if (user) {
        // 로그인한 사용자: 데이터베이스에 저장
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) return;

        // 퀴즈 기록 ID를 가져오기 위해 데이터베이스에서 조회
        const { data: quizRecord } = await getQuizRecord(slug, user.id);
        const quizRecordId = quizRecord?.id;

        if (!quizRecordId) {
          console.log(
            "❌ 퀴즈 기록을 찾을 수 없어 틀린 문제를 저장할 수 없습니다."
          );
          // UUID 형식이 아닌 경우 다른 방법으로 시도
          if (slug && !slug.includes("-")) {
            console.log("⚠️ UUID 형식이 아닌 ID, 다른 조회 방법 시도...");
            // 여기서 다른 조회 방법을 시도할 수 있습니다
          }
          return;
        }

        const response = await fetch("/api/wrong-answers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            quizRecordId: quizRecordId,
            quizTitle: quizRecord?.title || "퀴즈",
            wrongAnswers,
          }),
        });

        if (response.ok) {
          console.log("✅ 틀린 문제가 오답 노트에 저장되었습니다.");
        } else {
          console.error("❌ 틀린 문제 저장 실패");
        }
      } else {
        // 게스트 사용자: localStorage에 저장
        const existingWrongAnswers = JSON.parse(
          localStorage.getItem("wrong-answers") || "[]"
        );

        const newWrongAnswers = wrongAnswers.map((wrongAnswer) => ({
          ...wrongAnswer,
          id: crypto.randomUUID(),
          quiz_id: slug,
          quiz_title: "퀴즈",
          created_at: new Date().toISOString(),
        }));

        const updatedWrongAnswers = [
          ...existingWrongAnswers,
          ...newWrongAnswers,
        ];
        localStorage.setItem(
          "wrong-answers",
          JSON.stringify(updatedWrongAnswers)
        );

        console.log("✅ 틀린 문제가 로컬 오답 노트에 저장되었습니다.");
      }
    } catch (error) {
      console.error("틀린 문제 저장 중 오류:", error);
    }
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

    // 틀린 문제 저장 (한 번만 실행)
    if (user && quizData && !hasSavedWrongAnswers) {
      setHasSavedWrongAnswers(true);
      saveWrongAnswers();
    }

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
                const isCorrect = userAnswer?.isCorrect;

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      !isCorrect
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span
                        className={`text-2xl mr-2 ${isCorrect ? "✅" : "❌"}`}
                      ></span>
                      <span
                        className={`font-semibold ${
                          !isCorrect ? "text-red-700" : "text-gray-900"
                        }`}
                      >
                        문제 {index + 1}
                      </span>
                    </div>
                    <p
                      className={`mb-3 ${
                        !isCorrect ? "text-red-800" : "text-gray-900"
                      }`}
                    >
                      {question.question}
                    </p>

                    {/* 답안 표시 섹션 */}
                    <div className="space-y-2 mb-3">
                      {/* 사용자 답안 */}
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600 mr-2">
                          내 답안:
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            isCorrect
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {renderUserAnswer(question, userAnswer?.answer)}
                        </span>
                      </div>

                      {/* 틀린 경우에만 정답 표시 */}
                      {!isCorrect && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 mr-2">
                            정답:
                          </span>
                          <span className="px-2 py-1 rounded text-sm font-medium bg-green-100 text-green-800">
                            {renderCorrectAnswer(question)}
                          </span>
                        </div>
                      )}
                    </div>

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
                onClick={() => router.push("/wrong-answers")}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                📝 오답 노트 보기
              </button>
              <button
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                }}
              >
                공유하기
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
          {/* 내용 요약 토글 */}
          <button
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            className="w-full flex items-center justify-between text-left mb-4"
          >
            <h2 className="text-2xl font-bold">📝 내용 요약</h2>
            <span className="text-gray-500 transition-transform duration-200">
              {isSummaryOpen ? "↑" : "↓"}
            </span>
          </button>

          {isSummaryOpen && (
            <div className="mb-6">
              <p className="text-gray-700">{quizData.summary}</p>
            </div>
          )}

          {/* 핵심 포인트 토글 */}
          <button
            onClick={() => setIsKeyPointsOpen(!isKeyPointsOpen)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="text-lg font-semibold">🔑 핵심 포인트</h3>
            <span className="text-gray-500 transition-transform duration-200">
              {isKeyPointsOpen ? "↑" : "↓"}
            </span>
          </button>

          {isKeyPointsOpen && (
            <div className="mt-3">
              <ul className="list-disc list-inside space-y-2">
                {quizData.keyPoints.map((point, index) => (
                  <li key={index} className="text-gray-700">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 퀴즈 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">📘 퀴즈</h1>
              {user && (
                <button
                  onClick={toggleFavorite}
                  disabled={isTogglingFavorite}
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite
                      ? "text-red-500 hover:text-red-700 hover:bg-red-50"
                      : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                  } disabled:opacity-50`}
                  title={isFavorite ? "즐겨찾기에서 제거" : "즐겨찾기에 추가"}
                >
                  {isTogglingFavorite ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                  ) : (
                    <svg
                      className="h-6 w-6"
                      fill={isFavorite ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
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

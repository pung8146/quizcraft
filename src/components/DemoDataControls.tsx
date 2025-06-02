"use client";

import { useState } from "react";
import {
  initializeDemoData,
  clearDemoData,
  resetDemoData,
  demoQuizzes,
} from "@/lib/demoData";

interface DemoDataControlsProps {
  className?: string;
}

export default function DemoDataControls({
  className = "",
}: DemoDataControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");

  const handleInitialize = () => {
    initializeDemoData();
    setMessage("✅ 데모 데이터가 초기화되었습니다!");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleClear = () => {
    if (confirm("모든 데모 데이터를 삭제하시겠습니까?")) {
      clearDemoData();
      setMessage("🗑️ 데모 데이터가 삭제되었습니다!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleReset = () => {
    if (confirm("데모 데이터를 재설정하시겠습니까?")) {
      resetDemoData();
      setMessage("🔄 데모 데이터가 재설정되었습니다!");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  return (
    <div
      className={`bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
          🛠️ 개발자 도구
        </h3>
        <button
          onClick={handleToggleExpanded}
          onKeyDown={(e) => handleKeyDown(e, handleToggleExpanded)}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors px-2 py-1 rounded hover:bg-gray-100"
          tabIndex={0}
          aria-label={isExpanded ? "도구 접기" : "도구 펼치기"}
        >
          {isExpanded ? "접기 ▲" : "펼치기 ▼"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 sm:space-y-6">
          <div className="text-sm sm:text-base text-gray-600">
            <p className="mb-2 sm:mb-3">
              <strong>데모 데이터:</strong> {demoQuizzes.length}개의 샘플 퀴즈가
              준비되어 있습니다.
            </p>
            <ul className="text-xs sm:text-sm space-y-1 ml-4 text-gray-500">
              {demoQuizzes.map((quiz) => (
                <li key={quiz.id}>• {quiz.title}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button
              onClick={handleInitialize}
              onKeyDown={(e) => handleKeyDown(e, handleInitialize)}
              className="w-full px-4 py-3 sm:py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              tabIndex={0}
              aria-label="데모 데이터 초기화"
            >
              📚 데이터 초기화
            </button>

            <button
              onClick={handleClear}
              onKeyDown={(e) => handleKeyDown(e, handleClear)}
              className="w-full px-4 py-3 sm:py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              tabIndex={0}
              aria-label="데모 데이터 삭제"
            >
              🗑️ 데이터 삭제
            </button>

            <button
              onClick={handleReset}
              onKeyDown={(e) => handleKeyDown(e, handleReset)}
              className="w-full px-4 py-3 sm:py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
              tabIndex={0}
              aria-label="데모 데이터 재설정"
            >
              🔄 데이터 재설정
            </button>
          </div>

          {message && (
            <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm sm:text-base text-yellow-800">
              {message}
            </div>
          )}

          <div className="text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t border-gray-200">
            <p className="font-medium mb-2">
              <strong>사용법:</strong>
            </p>
            <ul className="space-y-1 ml-2 sm:ml-3">
              <li>
                • <strong>초기화:</strong> 데모 데이터가 없을 때만 추가
              </li>
              <li>
                • <strong>삭제:</strong> 모든 데모 데이터를 삭제
              </li>
              <li>
                • <strong>재설정:</strong> 기존 데이터를 삭제하고 새로 초기화
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

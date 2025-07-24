"use client";

import { useEffect, useState, useRef } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onRemove: (id: string) => void;
}

const Toast = ({ message, onRemove }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  // 개선: ref로 시간 및 애니메이션 ID 관리
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const duration = message.duration || 5000;

  // 진행 바 업데이트 함수
  const updateProgress = () => {
    if (isPaused) {
      if (pauseStartRef.current === null) {
        pauseStartRef.current = Date.now();
      }
      rafIdRef.current = requestAnimationFrame(updateProgress);
      return;
    } else if (pauseStartRef.current !== null) {
      // 일시정지 해제 시, 일시정지된 시간 누적
      pausedTimeRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
    const elapsed = Date.now() - startTimeRef.current - pausedTimeRef.current;
    const remaining = Math.max(0, duration - elapsed);
    const newProgress = (remaining / duration) * 100;
    setProgress(newProgress);
    if (remaining > 0) {
      rafIdRef.current = requestAnimationFrame(updateProgress);
    } else {
      handleRemove();
    }
  };

  useEffect(() => {
    setProgress(100);
    setIsVisible(false);
    setIsRemoving(false);
    pausedTimeRef.current = 0;
    pauseStartRef.current = null;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    // 애니메이션을 위해 약간의 지연
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    const progressTimer = setTimeout(() => {
      startTimeRef.current = Date.now();
      pausedTimeRef.current = 0;
      pauseStartRef.current = null;
      rafIdRef.current = requestAnimationFrame(updateProgress);
    }, 100);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(progressTimer);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
    // message.duration만 의존성에 둔다 (isPaused 제거)
  }, [message.duration]);

  useEffect(() => {
    // isPaused가 바뀔 때마다 updateProgress를 트리거
    if (!isPaused && pauseStartRef.current !== null) {
      // 일시정지 해제 시 즉시 진행 재개
      updateProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(message.id);
    }, 300);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const getTypeStyles = () => {
    switch (message.type) {
      case "success":
        return {
          container: "bg-green-50 border-green-200 text-green-800",
          icon: "🎉",
          iconBg: "bg-green-100",
        };
      case "info":
        return {
          container: "bg-blue-50 border-blue-200 text-blue-800",
          icon: "ℹ️",
          iconBg: "bg-blue-100",
        };
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200 text-yellow-800",
          icon: "⚠️",
          iconBg: "bg-yellow-100",
        };
      case "error":
        return {
          container: "bg-red-50 border-red-200 text-red-800",
          icon: "❌",
          iconBg: "bg-red-100",
        };
      default:
        return {
          container: "bg-gray-50 border-gray-200 text-gray-800",
          icon: "📌",
          iconBg: "bg-gray-100",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`
        max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${
          isVisible && !isRemoving
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95"
        }
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`
          ${styles.container}
          border rounded-lg shadow-lg overflow-hidden
          backdrop-blur-sm relative
        `}
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div
              className={`
                ${styles.iconBg}
                rounded-full p-1 flex-shrink-0
              `}
            >
              <span className="text-sm">{styles.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{message.title}</h4>
              <p className="text-sm mt-1 opacity-90 whitespace-pre-line">
                {message.message}
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="h-1 bg-black/10 relative">
          <div
            className={`
              h-full transition-all duration-100 ease-linear
              ${
                message.type === "success"
                  ? "bg-green-500"
                  : message.type === "info"
                  ? "bg-blue-500"
                  : message.type === "warning"
                  ? "bg-yellow-500"
                  : message.type === "error"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }
              ${isPaused ? "opacity-70" : "opacity-100"}
            `}
            style={{
              width: `${progress}%`,
              transition: isPaused
                ? "opacity 0.2s ease"
                : "width 0.1s linear, opacity 0.2s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
};

// 토스트 컨테이너 컴포넌트
interface ToastContainerProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer = ({ messages, onRemove }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
      {messages.map((message) => (
        <div key={message.id} className="pointer-events-auto">
          <Toast message={message} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

export default Toast;

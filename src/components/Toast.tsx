"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    // 애니메이션을 위해 약간의 지연
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    const duration = message.duration || 5000;
    const startTime = Date.now();
    let pausedTime = 0;

    // 진행 바 업데이트
    const updateProgress = () => {
      if (isPaused) {
        pausedTime += 16; // ~60fps
        requestAnimationFrame(updateProgress);
        return;
      }

      const elapsed = Date.now() - startTime - pausedTime;
      const remaining = Math.max(0, duration - elapsed);
      const newProgress = (remaining / duration) * 100;

      setProgress(newProgress);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        handleRemove();
      }
    };

    // 진행 바 시작
    const progressTimer = setTimeout(() => {
      requestAnimationFrame(updateProgress);
    }, 100);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(progressTimer);
    };
  }, [message.duration, isPaused]);

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

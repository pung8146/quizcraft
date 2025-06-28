"use client";

import {
  useContext,
  createContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { ToastMessage } from "@/components/Toast";

interface ToastContextType {
  messages: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
    };

    setMessages((prev) => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setMessages([]);
  }, []);

  const value = {
    messages,
    addToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// 편의 함수들
export const useToastHelpers = () => {
  const { addToast } = useToast();

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      addToast({ type: "success", title, message, duration });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      addToast({ type: "info", title, message, duration });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      addToast({ type: "warning", title, message, duration });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      addToast({ type: "error", title, message, duration });
    },
    [addToast]
  );

  return {
    showSuccess,
    showInfo,
    showWarning,
    showError,
  };
};

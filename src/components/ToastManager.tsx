"use client";

import { ToastContainer } from "./Toast";
import { useToast } from "@/hooks/useToast";

export default function ToastManager() {
  const { messages, removeToast } = useToast();

  console.log("📋 ToastManager 렌더링, 메시지 수:", messages.length);

  return <ToastContainer messages={messages} onRemove={removeToast} />;
}

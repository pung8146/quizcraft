"use client";

import { ToastContainer } from "./Toast";
import { useToast } from "@/hooks/useToast";

export default function ToastManager() {
  const { messages, removeToast } = useToast();

  return <ToastContainer messages={messages} onRemove={removeToast} />;
}

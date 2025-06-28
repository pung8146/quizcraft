import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ToastProvider } from "@/hooks/useToast";
import ToastManager from "@/components/ToastManager";

export const metadata: Metadata = {
  title: "QuizCraft",
  description: "AI 기반 퀴즈 생성 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-white">
        <ToastProvider>
          <AuthProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <ToastManager />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

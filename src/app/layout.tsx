import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'QuizCraft',
  description: 'AI 기반 퀴즈 생성 플랫폼',
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
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

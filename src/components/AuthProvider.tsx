"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToastHelpers } from "@/hooks/useToast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { showSuccess, showInfo } = useToastHelpers();

  // 로그인 토스트가 이미 표시되었는지 추적하는 ref
  const hasShownLoginToast = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 초기 세션 가져오기
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setIsInitialized(true);

      // 초기 세션이 있다면 이미 로그인된 상태이므로 토스트 표시하지 않음
      if (session?.user) {
        hasShownLoginToast.current = true;
        lastUserIdRef.current = session.user.id;
      }
    };

    getInitialSession();

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const prevUser = user;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // 초기화 후에만 토스트 메시지 표시
      if (isInitialized) {
        if (event === "SIGNED_IN" && session?.user) {
          // 새로운 사용자이거나 아직 로그인 토스트를 표시하지 않은 경우에만 표시
          const isNewUser = lastUserIdRef.current !== session.user.id;
          if (isNewUser || !hasShownLoginToast.current) {
            const userName =
              session.user.user_metadata?.name || session.user.email;
            showSuccess(
              "로그인 성공! 🎉",
              `${userName}님, 환영합니다!\n퀴즈가 클라우드에 안전하게 저장됩니다.`,
              4000
            );
            hasShownLoginToast.current = true;
            lastUserIdRef.current = session.user.id;
          }
        } else if (event === "SIGNED_OUT" && prevUser) {
          showInfo(
            "로그아웃 완료",
            "안전하게 로그아웃되었습니다.\n게스트 모드로 계속 이용하실 수 있습니다.",
            3000
          );
          // 로그아웃 시 토스트 플래그 리셋
          hasShownLoginToast.current = false;
          lastUserIdRef.current = null;
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []); // 의존성 배열에서 user와 기타 상태들을 제거하여 한 번만 실행되도록 함

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

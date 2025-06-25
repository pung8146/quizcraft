import { supabase } from './supabase';
import { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
}

// 현재 세션 가져오기
export const getCurrentSession = async (): Promise<Session | null> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error('세션 가져오기 오류:', error);
    return null;
  }
  return session;
};

// 현재 사용자 가져오기
export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    console.error('사용자 가져오기 오류:', error);
    return null;
  }
  return user;
};

// 로그아웃
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
};

// 이메일/비밀번호로 로그인
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    error,
  };
};

// 이메일/비밀번호로 회원가입
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  return {
    user: data.user,
    error,
  };
};

// 비밀번호 재설정 이메일 보내기
export const resetPassword = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  return { error };
};

// 사용자 프로필 업데이트
export const updateProfile = async (updates: {
  name?: string;
  avatar_url?: string;
}): Promise<{ error: AuthError | null }> => {
  const { error } = await supabase.auth.updateUser({
    data: updates,
  });

  return { error };
};

import { supabase } from "./supabase";
import { createClient } from "@supabase/supabase-js";
import { GeneratedQuiz } from "./openai";

export interface QuizRecord {
  id: string;
  user_id: string;
  title: string;
  tag?: string;
  original_content: string;
  prompt_used: string;
  generated_quiz: GeneratedQuiz;
  created_at: string;
  updated_at: string;
}

export interface CreateQuizRecordData {
  title: string;
  tag?: string;
  original_content: string;
  prompt_used: string;
  generated_quiz: GeneratedQuiz;
}

/**
 * 새로운 퀴즈 기록을 데이터베이스에 저장
 */
export async function saveQuizRecord(
  userId: string,
  quizData: CreateQuizRecordData
): Promise<{ data: QuizRecord | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("quiz_records")
      .insert({
        user_id: userId,
        title: quizData.title,
        tag: quizData.tag,
        original_content: quizData.original_content,
        prompt_used: quizData.prompt_used,
        generated_quiz: quizData.generated_quiz,
      })
      .select()
      .single();

    if (error) {
      console.error("퀴즈 저장 오류:", error);
      return { data: null, error: error.message };
    }

    return { data: data as QuizRecord, error: null };
  } catch (error) {
    console.error("퀴즈 저장 중 예외 발생:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자의 퀴즈 기록 목록 조회
 */
export async function getUserQuizRecords(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ data: QuizRecord[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("quiz_records")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("퀴즈 기록 조회 오류:", error);
      return { data: null, error: error.message };
    }

    return { data: data as QuizRecord[], error: null };
  } catch (error) {
    console.error("퀴즈 기록 조회 중 예외 발생:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 특정 퀴즈 기록 조회
 */
export async function getQuizRecord(
  quizId: string,
  userId: string
): Promise<{ data: QuizRecord | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("quiz_records")
      .select("*")
      .eq("id", quizId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("퀴즈 기록 조회 오류:", error);
      return { data: null, error: error.message };
    }

    return { data: data as QuizRecord, error: null };
  } catch (error) {
    console.error("퀴즈 기록 조회 중 예외 발생:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 퀴즈 기록 삭제
 */
export async function deleteQuizRecord(
  quizId: string,
  userId: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("quiz_records")
      .delete()
      .eq("id", quizId)
      .eq("user_id", userId);

    if (error) {
      console.error("퀴즈 삭제 오류:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error("퀴즈 삭제 중 예외 발생:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자의 퀴즈 기록 개수 조회
 */
export async function getUserQuizCount(
  userId: string
): Promise<{ count: number | null; error: string | null }> {
  try {
    const { count, error } = await supabase
      .from("quiz_records")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("퀴즈 개수 조회 오류:", error);
      return { count: null, error: error.message };
    }

    return { count, error: null };
  } catch (error) {
    console.error("퀴즈 개수 조회 중 예외 발생:", error);
    return {
      count: null,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 즐겨찾기 추가 (사용자별 클라이언트 사용)
 */
export async function addToFavorites(
  userId: string,
  quizId: string,
  userToken: string
): Promise<{
  data: {
    id: string;
    user_id: string;
    quiz_record_id: string;
    created_at: string;
  } | null;
  error: string | null;
}> {
  try {
    // 사용자별 Supabase 클라이언트 생성
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      }
    );

    const { data, error } = await userSupabase
      .from("favorites")
      .insert({
        user_id: userId,
        quiz_record_id: quizId,
      })
      .select()
      .single();

    if (error) {
      console.error("즐겨찾기 추가 오류:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error("즐겨찾기 추가 중 예외 발생:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 즐겨찾기 제거 (사용자별 클라이언트 사용)
 */
export async function removeFromFavorites(
  userId: string,
  quizId: string,
  userToken: string
): Promise<{ error: string | null }> {
  try {
    // 사용자별 Supabase 클라이언트 생성
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      }
    );

    const { error } = await userSupabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("quiz_record_id", quizId);

    if (error) {
      console.error("즐겨찾기 제거 오류:", error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error("즐겨찾기 제거 중 예외 발생:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 즐겨찾기 상태 확인 (사용자별 클라이언트 사용)
 */
export async function isFavorite(
  userId: string,
  quizId: string,
  userToken: string
): Promise<{ isFavorite: boolean; error: string | null }> {
  try {
    // 사용자별 Supabase 클라이언트 생성
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      }
    );

    const { data, error } = await userSupabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("quiz_record_id", quizId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116는 결과가 없을 때
      console.error("즐겨찾기 상태 확인 오류:", error);
      return { isFavorite: false, error: error.message };
    }

    return { isFavorite: !!data, error: null };
  } catch (error) {
    console.error("즐겨찾기 상태 확인 중 예외 발생:", error);
    return {
      isFavorite: false,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 즐겨찾기한 퀴즈 목록 조회 (사용자별 클라이언트 사용)
 */
export async function getFavoriteQuizzes(
  userId: string,
  limit: number = 10,
  offset: number = 0,
  userToken: string
): Promise<{ data: QuizRecord[] | null; error: string | null }> {
  try {
    // 사용자별 Supabase 클라이언트 생성
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      }
    );

    const { data, error } = await userSupabase
      .from("favorites")
      .select(
        `
        quiz_record_id,
        quiz_records (
          id,
          user_id,
          title,
          tag,
          original_content,
          prompt_used,
          generated_quiz,
          created_at,
          updated_at
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("즐겨찾기 퀴즈 조회 오류:", error);
      return { data: null, error: error.message };
    }

    // quiz_records 데이터 추출
    const quizRecords =
      data?.map((item) => item.quiz_records).filter(Boolean) || [];
    return { data: quizRecords as unknown as QuizRecord[], error: null };
  } catch (error) {
    console.error("즐겨찾기 퀴즈 조회 중 예외 발생:", error);
    return {
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 즐겨찾기한 퀴즈 개수 조회 (사용자별 클라이언트 사용)
 */
export async function getFavoriteQuizCount(
  userId: string,
  userToken: string
): Promise<{ count: number | null; error: string | null }> {
  try {
    // 사용자별 Supabase 클라이언트 생성
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      }
    );

    const { count, error } = await userSupabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      console.error("즐겨찾기 개수 조회 오류:", error);
      return { count: null, error: error.message };
    }

    return { count, error: null };
  } catch (error) {
    console.error("즐겨찾기 개수 조회 중 예외 발생:", error);
    return {
      count: null,
      error:
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

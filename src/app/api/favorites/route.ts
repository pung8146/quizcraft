import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 즐겨찾기 추가
export async function POST(request: NextRequest) {
  try {
    const { quizId } = await request.json();

    if (!quizId) {
      return NextResponse.json(
        { error: "퀴즈 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 사용자 인증 확인
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다." },
        { status: 401 }
      );
    }

    // 사용자별 Supabase 클라이언트 생성 (RLS 정책 우회)
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // 사용자별 클라이언트로 직접 삽입
    const { data, error } = await userSupabase
      .from("favorites")
      .insert({
        user_id: user.id,
        quiz_record_id: quizId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("즐겨찾기 추가 오류:", error);
    return NextResponse.json(
      { error: "즐겨찾기 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 즐겨찾기 제거
export async function DELETE(request: NextRequest) {
  try {
    const { quizId } = await request.json();

    if (!quizId) {
      return NextResponse.json(
        { error: "퀴즈 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 사용자 인증 확인
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다." },
        { status: 401 }
      );
    }

    // 사용자별 Supabase 클라이언트 생성 (RLS 정책 우회)
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // 사용자별 클라이언트로 직접 삭제
    const { error } = await userSupabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("quiz_record_id", quizId);

    if (error) {
      return NextResponse.json({ error: error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("즐겨찾기 제거 오류:", error);
    return NextResponse.json(
      { error: "즐겨찾기 제거 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 즐겨찾기 상태 확인 및 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("quizId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // 사용자 인증 확인
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다." },
        { status: 401 }
      );
    }

    // 특정 퀴즈의 즐겨찾기 상태 확인
    if (quizId) {
      // 사용자별 Supabase 클라이언트 생성 (RLS 정책 우회)
      const userSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );

      const { data, error } = await userSupabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("quiz_record_id", quizId)
        .single();

      if (error && error.code !== "PGRST116") {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        isFavorite: !!data,
      });
    }

    // 즐겨찾기 목록 조회
    // 사용자별 Supabase 클라이언트 생성 (RLS 정책 우회)
    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // 즐겨찾기 목록과 개수 조회
    const [favoritesResult, countResult] = await Promise.all([
      userSupabase
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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1),
      userSupabase
        .from("favorites")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    if (favoritesResult.error) {
      return NextResponse.json(
        { error: favoritesResult.error.message },
        { status: 500 }
      );
    }

    if (countResult.error) {
      return NextResponse.json(
        { error: countResult.error.message },
        { status: 500 }
      );
    }

    // quiz_records 데이터 추출
    const quizRecords =
      favoritesResult.data?.map((item) => item.quiz_records).filter(Boolean) ||
      [];
    const totalCount = countResult.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        records: quizRecords,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("즐겨찾기 조회 오류:", error);
    return NextResponse.json(
      { error: "즐겨찾기 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

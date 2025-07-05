import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (!user || userError) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { quizId, quizTitle, wrongAnswers } = body;

    if (!quizId || !wrongAnswers || !Array.isArray(wrongAnswers)) {
      return NextResponse.json(
        { error: "필수 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 틀린 문제들을 데이터베이스에 저장
    const { data, error } = await supabase
      .from("wrong_answers")
      .insert(
        wrongAnswers.map(
          (answer: {
            questionIndex: number;
            questionText: string;
            userAnswer: string | number | boolean;
            correctAnswer: string | number | boolean;
            explanation?: string;
          }) => ({
            user_id: user.id,
            quiz_id: quizId,
            quiz_title: quizTitle,
            question_index: answer.questionIndex,
            question_text: answer.questionText,
            user_answer: answer.userAnswer,
            correct_answer: answer.correctAnswer,
            explanation: answer.explanation,
          })
        )
      )
      .select();

    if (error) {
      console.error("틀린 문제 저장 오류:", error);
      return NextResponse.json(
        { error: "틀린 문제 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("틀린 문제 저장 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "틀린 문제 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (!user || userError) {
      return NextResponse.json(
        { error: "유효하지 않은 토큰입니다." },
        { status: 401 }
      );
    }

    // URL 파라미터에서 페이지네이션 정보 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // 사용자의 틀린 문제들 조회
    const { data, error } = await supabase
      .from("wrong_answers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("틀린 문제 조회 오류:", error);
      return NextResponse.json(
        { error: "틀린 문제 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    // 총 개수 조회
    const { count } = await supabase
      .from("wrong_answers")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: {
        wrongAnswers: data || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords: count || 0,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("틀린 문제 조회 중 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "틀린 문제 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

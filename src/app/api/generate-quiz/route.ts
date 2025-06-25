import { NextRequest, NextResponse } from "next/server";
import { generateQuizFromContent } from "@/lib/openai";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    // 환경변수 확인
    console.log("=== API 라우트 디버깅 ===");
    console.log(
      "API 키 상태:",
      process.env.OPENAI_API_KEY ? "설정됨" : "❌ 설정되지 않음"
    );

    const {
      content,
      title,
      saveToDatabase = false,
      quizOptions,
    } = await request.json();
    console.log("받은 내용 길이:", content?.length || 0);
    console.log("저장 여부:", saveToDatabase);
    console.log("퀴즈 옵션:", quizOptions);

    if (
      !content ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "유효한 텍스트 내용을 제공해주세요." },
        { status: 400 }
      );
    }

    // 텍스트 길이 제한 (너무 긴 텍스트는 토큰 제한에 걸릴 수 있음)
    if (content.length > 10000) {
      return NextResponse.json(
        { error: "텍스트가 너무 깁니다. 10,000자 이하로 줄여주세요." },
        { status: 400 }
      );
    }

    console.log("퀴즈 생성 시작...");
    const generatedQuiz = await generateQuizFromContent(content, quizOptions);
    console.log("퀴즈 생성 완료!");

    // 로그인한 사용자이고 저장 요청이 있는 경우 데이터베이스에 저장
    let savedRecord = null;
    if (saveToDatabase) {
      console.log("🔄 데이터베이스 저장 시도 중...");
      try {
        // 요청 헤더에서 Authorization 토큰 확인
        const authHeader = request.headers.get("authorization");
        console.log("Authorization 헤더 상태:", authHeader ? "존재함" : "없음");

        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1];
          console.log("토큰 길이:", token.length);

          // Supabase에서 사용자 정보 확인
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser(token);

          console.log("사용자 인증 결과:", user ? `성공 (${user.id})` : "실패");
          console.log("사용자 인증 오류:", userError?.message || "없음");

          if (user && !userError) {
            const quizTitle =
              title || `퀴즈 - ${new Date().toLocaleDateString("ko-KR")}`;
            const promptUsed = `다음 텍스트를 분석하여 요약, 핵심 포인트, 그리고 다양한 유형의 퀴즈를 생성해주세요.

텍스트:
${content}`;

            console.log("💾 데이터베이스에 저장 중...", {
              userId: user.id,
              title: quizTitle,
            });

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
              .from("quiz_records")
              .insert({
                user_id: user.id,
                title: quizTitle,
                original_content: content,
                prompt_used: promptUsed,
                generated_quiz: generatedQuiz,
              })
              .select()
              .single();

            if (error) {
              console.error("❌ 퀴즈 저장 실패:", error);
            } else {
              savedRecord = data;
              console.log("✅ 퀴즈 저장 성공:", data?.id);
            }
          } else {
            console.log("⚠️ 사용자 인증 실패");
          }
        } else {
          console.log("⚠️ Authorization 헤더가 없거나 형식이 잘못됨");
        }
      } catch (dbError) {
        console.error("❌ 데이터베이스 저장 중 오류:", dbError);
        // 저장 실패해도 퀴즈 생성 결과는 반환
      }
    } else {
      console.log("ℹ️ 데이터베이스 저장 요청되지 않음");
    }

    return NextResponse.json({
      success: true,
      data: generatedQuiz,
      savedRecord,
    });
  } catch (error) {
    console.error("=== 상세 오류 정보 ===");
    console.error("오류 타입:", error?.constructor?.name);
    console.error(
      "오류 메시지:",
      error instanceof Error ? error.message : error
    );
    console.error("전체 오류:", error);

    // OpenAI 관련 오류 처리
    if (error instanceof Error) {
      if (
        error.message.includes("API key") ||
        error.message.includes("apiKey")
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "OpenAI API 키가 설정되지 않았거나 올바르지 않습니다. .env.local 파일을 확인해주세요.",
          },
          { status: 500 }
        );
      }

      if (error.message.includes("JSON") || error.message.includes("parse")) {
        return NextResponse.json(
          {
            success: false,
            error: "AI 응답 형식 오류가 발생했습니다. 다시 시도해주세요.",
          },
          { status: 500 }
        );
      }

      if (
        error.message.includes("quota") ||
        error.message.includes("rate limit")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.",
          },
          { status: 500 }
        );
      }
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "퀴즈 생성 중 알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "POST 요청만 지원합니다." },
    { status: 405 }
  );
}

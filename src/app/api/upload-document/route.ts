import { NextRequest, NextResponse } from "next/server";
import {
  parseDocument,
  validateFileSize,
  isSupportedFileType,
} from "@/lib/serverDocumentParser";
import { generateQuizFromContent, generateTitleAndTag } from "@/lib/openai";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    console.log("=== 문서 업로드 API 시작 ===");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const saveToDatabase = formData.get("saveToDatabase") === "true";
    const quizOptions = formData.get("quizOptions")
      ? JSON.parse(formData.get("quizOptions") as string)
      : null;
    const autoGenerateTitle = formData.get("autoGenerateTitle") !== "false";

    if (!file) {
      return NextResponse.json(
        { error: "파일을 업로드해주세요." },
        { status: 400 }
      );
    }

    console.log("업로드된 파일:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // 파일 크기 검증 (10MB 제한)
    if (!validateFileSize(file, 10)) {
      return NextResponse.json(
        {
          error: "파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.",
        },
        { status: 400 }
      );
    }

    // 지원하는 파일 형식 검증
    if (!isSupportedFileType(file)) {
      return NextResponse.json(
        {
          error:
            "지원하지 않는 파일 형식입니다. PDF, DOCX, TXT 파일만 지원합니다.",
        },
        { status: 400 }
      );
    }

    // 파일 내용 파싱
    console.log("📄 파일 내용 파싱 시작...");
    const documentContent = await parseDocument(file);

    console.log("✅ 파일 파싱 완료:", {
      title: documentContent.title,
      textLength: documentContent.text.length,
      metadata: documentContent.metadata,
    });

    // 텍스트 길이 제한 확인
    if (documentContent.text.length > 15000) {
      return NextResponse.json(
        { error: "문서 내용이 너무 깁니다. 더 짧은 문서를 선택해주세요." },
        { status: 400 }
      );
    }

    if (documentContent.text.length < 300) {
      return NextResponse.json(
        { error: "문서 내용이 너무 짧습니다. 더 긴 문서를 선택해주세요." },
        { status: 400 }
      );
    }

    // 자동 제목 및 태그 생성
    let finalTitle = documentContent.title;
    let tag = "";

    if (autoGenerateTitle) {
      console.log("🤖 자동 제목/태그 생성 중...");
      try {
        const titleAndTag = await generateTitleAndTag(documentContent.text);
        finalTitle = titleAndTag.title;
        tag = titleAndTag.tag;
        console.log("✅ 생성된 제목:", finalTitle);
        console.log("✅ 생성된 태그:", tag);
      } catch (titleError) {
        console.error("⚠️ 제목/태그 생성 실패, 기본값 사용:", titleError);
        finalTitle =
          documentContent.title ||
          `퀴즈 - ${new Date().toLocaleDateString("ko-KR")}`;
        tag = "일반";
      }
    }

    // 퀴즈 생성
    console.log("퀴즈 생성 시작...");
    const generatedQuiz = await generateQuizFromContent(
      documentContent.text,
      quizOptions
    );
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
              finalTitle || `퀴즈 - ${new Date().toLocaleDateString("ko-KR")}`;
            const promptUsed = `다음 문서를 분석하여 요약, 핵심 포인트, 그리고 다양한 유형의 퀴즈를 생성해주세요.

문서:
${documentContent.text}`;

            console.log("💾 데이터베이스에 저장 중...", {
              userId: user.id,
              title: quizTitle,
              tag: tag,
              fileName: file.name,
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
                tag: tag,
                original_content: documentContent.text,
                prompt_used: promptUsed,
                generated_quiz: generatedQuiz,
                source_file: file.name, // 파일명 추가
              })
              .select()
              .single();

            if (error) {
              console.error("❌ 퀴즈 저장 실패:", error);
            } else {
              savedRecord = data;
              console.log("✅ 퀴즈 저장 성공:", data?.id);
              // 저장된 레코드의 ID를 반환하여 클라이언트에서 사용할 수 있도록 함
              savedRecord = {
                ...data,
                slug: data.id, // slug 필드 추가
              };
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
      generatedTitle: finalTitle,
      generatedTag: tag,
      sourceInfo: {
        fileName: file.name,
        fileSize: file.size,
        originalTitle: documentContent.title,
        excerpt:
          documentContent.text.substring(0, 300) +
          (documentContent.text.length > 300 ? "..." : ""),
      },
    });
  } catch (error) {
    console.error("=== 상세 오류 정보 ===");
    console.error("오류 타입:", error?.constructor?.name);
    console.error(
      "오류 메시지:",
      error instanceof Error ? error.message : error
    );
    console.error("전체 오류:", error);

    // 파일 파싱 관련 오류 처리
    if (error instanceof Error) {
      if (error.message.includes("PDF 파일을 읽을 수 없습니다")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }

      if (error.message.includes("DOCX 파일을 읽을 수 없습니다")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }

      if (error.message.includes("지원하지 않는 파일 형식")) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 }
        );
      }
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "문서 업로드 중 알 수 없는 오류가 발생했습니다.";

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

import { NextRequest, NextResponse } from 'next/server';
import { generateQuizFromContent } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: '유효한 텍스트 내용을 제공해주세요.' },
        { status: 400 }
      );
    }

    // 텍스트 길이 제한 (너무 긴 텍스트는 토큰 제한에 걸릴 수 있음)
    if (content.length > 10000) {
      return NextResponse.json(
        { error: '텍스트가 너무 깁니다. 10,000자 이하로 줄여주세요.' },
        { status: 400 }
      );
    }

    const generatedQuiz = await generateQuizFromContent(content);

    return NextResponse.json({
      success: true,
      data: generatedQuiz,
    });
  } catch (error) {
    console.error('퀴즈 생성 API 오류:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : '퀴즈 생성 중 알 수 없는 오류가 발생했습니다.';

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
    { message: 'POST 요청만 지원합니다.' },
    { status: 405 }
  );
}

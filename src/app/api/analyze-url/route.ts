import { NextRequest, NextResponse } from 'next/server';
import { analyzeUrl, UrlAnalysisResult } from '@/lib/urlAnalyzer';
import { generateQuizFromContent, generateTitleAndTag } from '@/lib/openai';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface RequestBody {
  url: string;
  saveToDatabase?: boolean;
  quizOptions?: {
    types: {
      multipleChoice: boolean;
      trueOrFalse: boolean;
      fillInBlank: boolean;
    };
    questionCount: number;
  };
  autoGenerateTitle?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== URL 분석 API 시작 ===');

    const {
      url,
      saveToDatabase = false,
      quizOptions,
      autoGenerateTitle = true,
    }: RequestBody = await request.json();

    console.log('URL:', url);
    console.log('저장 여부:', saveToDatabase);
    console.log('퀴즈 옵션:', quizOptions);

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        { error: '유효한 URL을 제공해주세요.' },
        { status: 400 }
      );
    }

    // 1단계: URL 분석 및 본문 추출
    console.log('🔍 1단계: URL 분석 시작...');
    const analysisResult = await analyzeUrl(url.trim());

    // 분석 실패 시 오류 반환
    if ('error' in analysisResult) {
      console.error('❌ URL 분석 실패:', analysisResult.error);
      return NextResponse.json(
        {
          error: analysisResult.error,
          details: analysisResult.details,
        },
        { status: 400 }
      );
    }

    const urlResult = analysisResult as UrlAnalysisResult;
    console.log('✅ URL 분석 완료:', {
      title: urlResult.title,
      contentLength: urlResult.length,
      siteName: urlResult.siteName,
    });

    // 텍스트 길이 제한 확인
    if (urlResult.content.length > 15000) {
      return NextResponse.json(
        { error: '텍스트가 너무 깁니다. 더 짧은 페이지를 선택해주세요.' },
        { status: 400 }
      );
    }

    if (urlResult.content.length < 300) {
      return NextResponse.json(
        {
          error:
            '텍스트 내용이 너무 짧습니다. 더 긴 본문이 있는 페이지를 선택해주세요.',
        },
        { status: 400 }
      );
    }

    // 2단계: 자동 제목 및 태그 생성 (기존 제목이 없거나 자동 생성 요청시)
    let finalTitle = urlResult.title;
    let tag = '';

    if (autoGenerateTitle) {
      console.log('🤖 2단계: 자동 제목/태그 생성 중...');
      try {
        const titleAndTag = await generateTitleAndTag(urlResult.content);
        finalTitle = titleAndTag.title;
        tag = titleAndTag.tag;
        console.log('✅ 생성된 제목:', finalTitle);
        console.log('✅ 생성된 태그:', tag);
      } catch (titleError) {
        console.error('⚠️ 제목/태그 생성 실패, 기본값 사용:', titleError);
        finalTitle =
          urlResult.title || `퀴즈 - ${new Date().toLocaleDateString('ko-KR')}`;
        tag = '일반';
      }
    }

    // 3단계: 퀴즈 생성
    console.log('📝 3단계: 퀴즈 생성 시작...');
    const generatedQuiz = await generateQuizFromContent(
      urlResult.content,
      quizOptions
    );
    console.log('✅ 퀴즈 생성 완료!');

    // 4단계: 데이터베이스 저장 (옵션)
    let savedRecord = null;
    if (saveToDatabase) {
      console.log('💾 4단계: 데이터베이스 저장 시도 중...');
      try {
        const authHeader = request.headers.get('authorization');
        console.log('Authorization 헤더 상태:', authHeader ? '존재함' : '없음');

        if (authHeader?.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser(token);

          if (user && !userError) {
            const quizTitle =
              finalTitle || `퀴즈 - ${new Date().toLocaleDateString('ko-KR')}`;
            const promptUsed = `URL: ${url}

추출된 내용:
${urlResult.content}`;

            console.log('💾 데이터베이스에 저장 중...', {
              userId: user.id,
              title: quizTitle,
              tag: tag,
              url: url,
            });

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
              .from('quiz_records')
              .insert({
                user_id: user.id,
                title: quizTitle,
                tag: tag,
                original_content: urlResult.content,
                prompt_used: promptUsed,
                generated_quiz: generatedQuiz,
                source_url: url,
                content_metadata: {
                  siteName: urlResult.siteName,
                  originalTitle: urlResult.title,
                  contentLength: urlResult.length,
                  excerpt: urlResult.excerpt,
                },
              })
              .select()
              .single();

            if (error) {
              console.error('❌ 퀴즈 저장 실패:', error);
            } else {
              savedRecord = data;
              console.log('✅ 퀴즈 저장 성공:', data?.id);
            }
          } else {
            console.log('⚠️ 사용자 인증 실패');
          }
        }
      } catch (dbError) {
        console.error('❌ 데이터베이스 저장 중 오류:', dbError);
      }
    }

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: generatedQuiz,
      savedRecord,
      generatedTitle: finalTitle,
      generatedTag: tag,
      sourceInfo: {
        url: url,
        originalTitle: urlResult.title,
        siteName: urlResult.siteName,
        contentLength: urlResult.length,
        excerpt: urlResult.excerpt,
      },
    });
  } catch (error) {
    console.error('=== URL 분석 API 오류 ===');
    console.error('오류 타입:', error?.constructor?.name);
    console.error(
      '오류 메시지:',
      error instanceof Error ? error.message : error
    );

    // 구체적인 오류 처리
    if (error instanceof Error) {
      if (error.message.includes('abort')) {
        return NextResponse.json(
          {
            success: false,
            error: '요청 시간이 초과되었습니다. 다른 URL을 시도해주세요.',
          },
          { status: 408 }
        );
      }

      if (
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              '네트워크 연결 오류가 발생했습니다. URL을 확인하고 다시 시도해주세요.',
          },
          { status: 502 }
        );
      }

      if (
        error.message.includes('API key') ||
        error.message.includes('apiKey')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'OpenAI API 키가 설정되지 않았거나 올바르지 않습니다.',
          },
          { status: 500 }
        );
      }

      if (
        error.message.includes('quota') ||
        error.message.includes('rate limit')
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.',
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          'URL 분석 중 예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 테스트용 GET 엔드포인트
export async function GET() {
  return NextResponse.json({
    message: 'URL 분석 API가 정상적으로 작동하고 있습니다.',
    usage: 'POST 요청으로 { "url": "https://example.com" }를 전송하세요.',
    timestamp: new Date().toISOString(),
  });
}

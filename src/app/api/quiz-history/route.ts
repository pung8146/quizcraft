import { NextRequest, NextResponse } from 'next/server';
import { getUserQuizRecords, getUserQuizCount } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // 요청 헤더에서 Authorization 토큰 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Supabase에서 사용자 정보 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (!user || userError) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    // URL 파라미터에서 페이지네이션 정보 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 퀴즈 기록과 총 개수 조회
    const [recordsResult, countResult] = await Promise.all([
      getUserQuizRecords(user.id, limit, offset),
      getUserQuizCount(user.id),
    ]);

    if (recordsResult.error) {
      return NextResponse.json({ error: recordsResult.error }, { status: 500 });
    }

    if (countResult.error) {
      return NextResponse.json({ error: countResult.error }, { status: 500 });
    }

    const totalPages = Math.ceil((countResult.count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: {
        records: recordsResult.data || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords: countResult.count || 0,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('퀴즈 히스토리 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '퀴즈 히스토리 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

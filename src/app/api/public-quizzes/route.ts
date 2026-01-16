import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { QuizRecord } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // URL 파라미터에서 페이지네이션 정보 가져오기
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;

    // 쿼리 빌더 시작
    let query = supabase
      .from('quiz_records')
      .select(`
        id,
        title,
        tag,
        created_at,
        generated_quiz,
        user_id,
        profiles (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    // 태그 필터링
    if (tag && tag !== 'all') {
      if (tag === '기타') {
        query = query.is('tag', null);
      } else {
        query = query.eq('tag', tag);
      }
    }

    // 검색 필터링
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1);

    const { data: quizzes, error: quizzesError } = await query;

    if (quizzesError) {
      console.error('공개 퀴즈 조회 오류:', quizzesError);
      return NextResponse.json({ error: quizzesError.message }, { status: 500 });
    }

    // 총 개수 조회
    let countQuery = supabase
      .from('quiz_records')
      .select('*', { count: 'exact', head: true });

    if (tag && tag !== 'all') {
      if (tag === '기타') {
        countQuery = countQuery.is('tag', null);
      } else {
        countQuery = countQuery.eq('tag', tag);
      }
    }

    if (search) {
      countQuery = countQuery.ilike('title', `%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('퀴즈 개수 조회 오류:', countError);
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    // 태그 목록 조회
    const { data: tagData, error: tagError } = await supabase
      .from('quiz_records')
      .select('tag');

    const availableTags = tagError 
      ? [] 
      : [...new Set(tagData?.map(item => item.tag || '기타').filter(Boolean))];

    return NextResponse.json({
      success: true,
      data: {
        quizzes: quizzes || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalRecords: count || 0,
          limit,
        },
        availableTags,
      },
    });
  } catch (error) {
    console.error('공개 퀴즈 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '퀴즈 목록 조회 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 공개된 문의글만 조회 (최신순)
    const {
      data: inquiries,
      error,
      count,
    } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('문의글 조회 오류:', error);
      return NextResponse.json(
        { success: false, error: '문의글을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: {
        inquiries: inquiries || [],
        pagination: {
          currentPage: page,
          totalPages,
          totalCount: count || 0,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('문의게시판 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, author_name, email, is_public = true } = body;

    // 입력값 검증
    if (!title || !content || !author_name) {
      return NextResponse.json(
        { success: false, error: '제목, 내용, 작성자명은 필수입니다.' },
        { status: 400 }
      );
    }

    // 로그인 사용자 확인 (선택사항)
    const authHeader = request.headers.get('Authorization');
    let user_id = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(token);
      if (!authError && user) {
        user_id = user.id;
      }
    }

    // 문의글 저장
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .insert([
        {
          user_id,
          title,
          content,
          author_name,
          email,
          is_public,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('문의글 저장 오류:', error);
      return NextResponse.json(
        { success: false, error: '문의글 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: inquiry,
      message: '문의글이 성공적으로 등록되었습니다.',
    });
  } catch (error) {
    console.error('문의글 작성 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

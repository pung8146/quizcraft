import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 데이터베이스 상태 확인 중...');

    // 요청 헤더에서 Authorization 토큰 확인 (옵션)
    const authHeader = request.headers.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      console.log('토큰으로 사용자 확인 중...');

      // Supabase에서 사용자 정보 확인
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      if (user && !userError) {
        console.log('✅ 사용자 인증 성공:', user.id);

        // quiz_records 테이블에 접근 시도
        try {
          const { data, error } = await supabase
            .from('quiz_records')
            .select('count', { count: 'exact', head: true })
            .eq('user_id', user.id);

          if (error) {
            console.error('❌ 테이블 접근 오류:', error);
            return NextResponse.json({
              success: false,
              error: '테이블 접근 실패',
              details: error.message,
              tableExists: false,
            });
          }

          console.log('✅ quiz_records 테이블 접근 성공');
          return NextResponse.json({
            success: true,
            message: '데이터베이스 연결 및 테이블 접근 성공',
            user: {
              id: user.id,
              email: user.email,
            },
            tableExists: true,
            userQuizCount: data || 0,
          });
        } catch (dbError) {
          console.error('❌ 데이터베이스 오류:', dbError);
          return NextResponse.json({
            success: false,
            error: '데이터베이스 접근 실패',
            details:
              dbError instanceof Error ? dbError.message : '알 수 없는 오류',
            tableExists: false,
          });
        }
      } else {
        console.log('❌ 사용자 인증 실패:', userError?.message);
        return NextResponse.json({
          success: false,
          error: '사용자 인증 실패',
          details: userError?.message,
        });
      }
    } else {
      // 토큰 없이 테이블 존재 여부만 확인
      try {
        const { error } = await supabase
          .from('quiz_records')
          .select('count', { count: 'exact', head: true })
          .limit(0);

        if (error) {
          console.error('❌ 테이블 존재 여부 확인 실패:', error);
          return NextResponse.json({
            success: false,
            error: '테이블이 존재하지 않거나 접근할 수 없습니다',
            details: error.message,
            tableExists: false,
          });
        }

        console.log('✅ quiz_records 테이블 존재 확인');
        return NextResponse.json({
          success: true,
          message: '테이블이 존재합니다 (인증되지 않은 사용자)',
          tableExists: true,
        });
      } catch (dbError) {
        console.error('❌ 테이블 확인 오류:', dbError);
        return NextResponse.json({
          success: false,
          error: '테이블 확인 실패',
          details:
            dbError instanceof Error ? dbError.message : '알 수 없는 오류',
          tableExists: false,
        });
      }
    }
  } catch (error) {
    console.error('❌ 전체 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

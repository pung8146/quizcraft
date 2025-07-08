# 즐겨찾기 기능 설정 가이드

## 1. Supabase에서 즐겨찾기 테이블 생성

Supabase 프로젝트 대시보드에서 SQL Editor로 이동하여 다음 SQL을 실행하세요:

```sql
-- 즐겨찾기 테이블 생성
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_record_id UUID NOT NULL REFERENCES quiz_records(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quiz_record_id) -- 중복 즐겨찾기 방지
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_quiz_record_id ON favorites(quiz_record_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at);

-- Row Level Security (RLS) 활성화
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 사용자는 자신의 즐겨찾기만 조회할 수 있음
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- 정책 생성: 사용자는 자신의 즐겨찾기만 삽입할 수 있음
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 정책 생성: 사용자는 자신의 즐겨찾기만 삭제할 수 있음
CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

## 2. 테이블 생성 확인

SQL 실행 후 다음 명령어로 테이블이 제대로 생성되었는지 확인하세요:

```sql
-- 테이블 존재 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'favorites';

-- RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'favorites';
```

## 3. 문제 해결

### RLS 정책 오류가 발생하는 경우

1. **정책이 제대로 생성되었는지 확인**:

   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'favorites';
   ```

2. **정책을 다시 생성**:

   ```sql
   -- 기존 정책 삭제
   DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
   DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
   DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

   -- 정책 다시 생성
   CREATE POLICY "Users can view their own favorites"
     ON favorites FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own favorites"
     ON favorites FOR INSERT
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own favorites"
     ON favorites FOR DELETE
     USING (auth.uid() = user_id);
   ```

3. **RLS가 활성화되었는지 확인**:
   ```sql
   SELECT schemaname, tablename, rowsecurity
   FROM pg_tables
   WHERE tablename = 'favorites';
   ```

### 테이블이 존재하지 않는 경우

테이블이 없다면 위의 CREATE TABLE 문을 다시 실행하세요.

### 외래 키 제약 조건 오류

`quiz_records` 테이블이 존재하지 않는 경우, 먼저 퀴즈 테이블을 생성해야 합니다:

```sql
-- 퀴즈 테이블이 없다면 먼저 생성
CREATE TABLE IF NOT EXISTS quiz_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  tag VARCHAR(50),
  original_content TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  generated_quiz JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. 테스트

테이블 생성 후 다음 방법으로 테스트할 수 있습니다:

1. **브라우저에서 테스트**:

   - 로그인 후 퀴즈 페이지에서 즐겨찾기 버튼 클릭
   - 즐겨찾기 페이지에서 목록 확인

2. **API 테스트**:
   ```javascript
   // 브라우저 개발자 도구에서 실행
   const {
     data: { session },
   } = await supabase.auth.getSession();
   if (session) {
     const response = await fetch("/api/favorites?quizId=your-quiz-id", {
       headers: {
         Authorization: `Bearer ${session.access_token}`,
       },
     });
     const result = await response.json();
     console.log("즐겨찾기 상태:", result);
   }
   ```

## 5. 디버깅

문제가 지속되는 경우:

1. **브라우저 개발자 도구**에서 Network 탭 확인
2. **Supabase 로그**에서 오류 메시지 확인
3. **서버 로그**에서 API 오류 확인

오류 메시지가 "new row violates row-level security policy"인 경우:

- RLS 정책이 제대로 설정되지 않았거나
- 사용자 인증이 올바르게 전달되지 않았을 가능성이 높습니다

# Supabase 퀴즈 저장 기능 설정 가이드

## 1. Supabase 데이터베이스 테이블 생성

Supabase 프로젝트 대시보드에서 SQL Editor로 이동하여 다음 SQL을 실행하세요:

### 1-1. 퀴즈 기록 테이블

```sql
-- 퀴즈 생성 기록을 저장할 테이블 생성
CREATE TABLE quiz_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  tag VARCHAR(50), -- 태그 필드 추가 (선택사항)
  original_content TEXT NOT NULL,
  prompt_used TEXT NOT NULL,
  generated_quiz JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_quiz_records_user_id ON quiz_records(user_id);
CREATE INDEX idx_quiz_records_created_at ON quiz_records(created_at);
CREATE INDEX idx_quiz_records_tag ON quiz_records(tag); -- 태그 인덱스 추가

-- Row Level Security (RLS) 활성화
ALTER TABLE quiz_records ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 사용자는 자신의 퀴즈만 조회할 수 있음
CREATE POLICY "Users can view their own quiz records"
  ON quiz_records FOR SELECT
  USING (auth.uid() = user_id);

-- 정책 생성: 사용자는 자신의 퀴즈만 삽입할 수 있음
CREATE POLICY "Users can insert their own quiz records"
  ON quiz_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 정책 생성: 사용자는 자신의 퀴즈만 업데이트할 수 있음
CREATE POLICY "Users can update their own quiz records"
  ON quiz_records FOR UPDATE
  USING (auth.uid() = user_id);

-- 정책 생성: 사용자는 자신의 퀴즈만 삭제할 수 있음
CREATE POLICY "Users can delete their own quiz records"
  ON quiz_records FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_quiz_records_updated_at
  BEFORE UPDATE ON quiz_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 1-2. 틀린 문제 저장 테이블

```sql
-- 틀린 문제를 저장할 테이블 생성 (문제별 개별 저장)
CREATE TABLE wrong_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_record_id UUID REFERENCES quiz_records(id) ON DELETE CASCADE, -- 퀴즈 기록 참조
  quiz_title VARCHAR(255) NOT NULL, -- 퀴즈 제목
  question_index INTEGER NOT NULL, -- 문제 번호 (0부터 시작)
  question_type VARCHAR(50) NOT NULL, -- 문제 유형 (multiple-choice, true-false, fill-in-the-blank)
  question_text TEXT NOT NULL, -- 문제 내용
  user_answer TEXT NOT NULL, -- 사용자 답안
  correct_answer TEXT NOT NULL, -- 정답
  explanation TEXT, -- 설명 (선택사항)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_wrong_answers_user_id ON wrong_answers(user_id);
CREATE INDEX idx_wrong_answers_quiz_record_id ON wrong_answers(quiz_record_id);
CREATE INDEX idx_wrong_answers_created_at ON wrong_answers(created_at);
CREATE INDEX idx_wrong_answers_question_index ON wrong_answers(question_index);

-- Row Level Security (RLS) 활성화
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 사용자는 자신의 틀린 문제만 조회할 수 있음
CREATE POLICY "Users can view their own wrong answers"
  ON wrong_answers FOR SELECT
  USING (auth.uid() = user_id);

-- 정책 생성: 사용자는 자신의 틀린 문제만 삽입할 수 있음
CREATE POLICY "Users can insert their own wrong answers"
  ON wrong_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 정책 생성: 사용자는 자신의 틀린 문제만 삭제할 수 있음
CREATE POLICY "Users can delete their own wrong answers"
  ON wrong_answers FOR DELETE
  USING (auth.uid() = user_id);
```

### 1-3. 문의게시판 테이블

```sql
-- 문의게시판 테이블 생성
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- 로그인 사용자의 경우 (NULL 허용)
  author_name VARCHAR(100) NOT NULL, -- 작성자 이름 (게스트용)
  email VARCHAR(255), -- 연락처 이메일 (선택사항)
  title VARCHAR(255) NOT NULL, -- 문의 제목
  content TEXT NOT NULL, -- 문의 내용
  is_public BOOLEAN DEFAULT true, -- 공개 여부
  status VARCHAR(20) DEFAULT 'pending', -- 상태: pending, answered, closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);

-- Row Level Security (RLS) 활성화
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 모든 사용자가 문의 작성 가능
CREATE POLICY "Anyone can insert inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- 정책 생성: 공개된 문의는 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view public inquiries"
  ON inquiries FOR SELECT
  USING (is_public = true);

-- 정책 생성: 작성자는 자신의 문의 조회 가능 (비공개 포함)
CREATE POLICY "Authors can view their own inquiries"
  ON inquiries FOR SELECT
  USING (auth.uid() = user_id);

-- updated_at 트리거 생성 (위에서 생성한 함수 재사용)
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 1-3. 기존 테이블에 태그 컬럼 추가 (이미 테이블이 있는 경우)

만약 기존에 `quiz_records` 테이블이 있다면, 다음 SQL로 태그 컬럼을 추가하세요:

```sql
-- 기존 테이블에 태그 컬럼 추가
ALTER TABLE quiz_records
ADD COLUMN tag VARCHAR(50);

-- 태그 컬럼에 인덱스 추가 (성능 최적화)
CREATE INDEX idx_quiz_records_tag ON quiz_records(tag);
```

## 2. 환경변수 설정

`.env.local` 파일에 Supabase 설정이 있는지 확인하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## 3. API 사용법

### 퀴즈 생성 및 저장

```javascript
// 프론트엔드에서 퀴즈 생성 요청
const response = await fetch("/api/generate-quiz", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userToken}`, // 로그인한 사용자의 토큰
  },
  body: JSON.stringify({
    content: "학습할 텍스트 내용",
    title: "퀴즈 제목 (선택사항)",
    saveToDatabase: true, // 데이터베이스에 저장하려면 true
  }),
});

const result = await response.json();
console.log(result.data); // 생성된 퀴즈
console.log(result.savedRecord); // 저장된 기록 (저장된 경우)
```

### 퀴즈 히스토리 조회

```javascript
// 사용자의 퀴즈 히스토리 조회
const response = await fetch("/api/quiz-history?page=1&limit=10", {
  headers: {
    Authorization: `Bearer ${userToken}`,
  },
});

const result = await response.json();
console.log(result.data.records); // 퀴즈 기록 배열
console.log(result.data.pagination); // 페이지네이션 정보
```

## 4. 데이터 구조

### QuizRecord 타입

```typescript
interface QuizRecord {
  id: string;
  user_id: string;
  title: string;
  original_content: string;
  prompt_used: string;
  generated_quiz: GeneratedQuiz;
  created_at: string;
  updated_at: string;
}
```

### GeneratedQuiz 타입

```typescript
interface GeneratedQuiz {
  summary: string;
  keyPoints: string[];
  questions: QuizQuestion[];
}

interface QuizQuestion {
  type: "multiple-choice" | "true-false" | "fill-in-the-blank";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}
```

## 5. 보안 고려사항

- Row Level Security (RLS)가 활성화되어 있어 사용자는 자신의 데이터만 접근 가능합니다.
- 모든 API 요청에서 유효한 JWT 토큰이 필요합니다.
- 사용자 인증은 Supabase Auth를 통해 검증됩니다.

## 6. 주요 기능

1. **퀴즈 생성 및 자동 저장**: OpenAI로 퀴즈 생성 후 선택적으로 데이터베이스에 저장
2. **퀴즈 히스토리 조회**: 사용자별 퀴즈 생성 기록을 페이지네이션으로 조회
3. **안전한 데이터 접근**: RLS로 사용자별 데이터 격리
4. **자동 타임스탬프**: 생성/수정 시간 자동 관리

## 7. 디버깅 및 트러블슈팅

### 데이터베이스 연결 테스트

브라우저에서 다음 URL로 데이터베이스 상태를 확인하세요:

```
GET /api/test-db
```

로그인한 상태에서 테스트하려면:

```javascript
// 브라우저 개발자 도구에서 실행
const {
  data: { session },
} = await supabase.auth.getSession();
if (session) {
  const response = await fetch("/api/test-db", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  const result = await response.json();
  console.log("데이터베이스 테스트 결과:", result);
}
```

### 저장 기능 테스트

1. **로그인 확인**: 사용자가 로그인되어 있는지 확인
2. **콘솔 로그 확인**: 브라우저 개발자 도구에서 저장 관련 로그 확인
3. **서버 로그 확인**: 터미널에서 API 디버깅 로그 확인

### 일반적인 문제와 해결 방법

1. **테이블이 존재하지 않음**

   - Supabase 대시보드에서 SQL이 정상 실행되었는지 확인
   - `/api/test-db`로 테이블 존재 여부 확인

2. **권한 오류 (RLS 정책)**

   - Supabase 대시보드에서 RLS 정책이 활성화되었는지 확인
   - 사용자 인증이 제대로 되고 있는지 확인

3. **환경변수 문제**

   - `.env.local` 파일에 올바른 Supabase URL과 키가 설정되었는지 확인
   - 서버 재시작 후 다시 시도

4. **토큰 전달 문제**
   - 브라우저 개발자 도구 Network 탭에서 Authorization 헤더 확인
   - 토큰이 만료되지 않았는지 확인

## 8. 다음 단계

- 퀴즈 수정/삭제 기능 추가
- 퀴즈 공유 기능 구현
- 태그/카테고리 시스템 추가
- 퀴즈 검색 기능 구현

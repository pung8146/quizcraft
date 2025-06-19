# 📘 Markdown Quiz

**Markdown 문서를 기반으로 학습용 퀴즈를 자동 생성하는 도구입니다.**  
마크다운 문서를 붙여넣기만 하면, 특정 조건에 따라 텍스트가 공란 처리되어 사용자에게 문제 형태로 제공됩니다.

---

## ✨ 주요 기능

### 📝 마크다운 문서 입력

- 사용자가 작성한 `.md` 형식의 문서를 에디터에 붙여넣을 수 있습니다.
- 마크다운 문서는 **브라우저 LocalStorage**에 저장됩니다.

### 📋 샘플 문서 체험

- **5가지 주제의 샘플 문서**가 미리 준비되어 있습니다:
  - React 기초 개념
  - JavaScript ES6+ 핵심 기능
  - TypeScript 기본 개념
  - CSS Flexbox 완전 정복
  - Node.js 기초와 Express.js
- 샘플을 선택하면 에디터에 자동으로 내용이 입력됩니다.

### 📚 변환된 문서 목록 확인

- 저장된 문서는 변환 목록에서 쉽게 확인하고 다시 불러올 수 있습니다.

### 🧠 자동 퀴즈 변환

- 문서 내 **특정 조건에 따라 텍스트가 공란으로 변환**되어 문제로 제공됩니다.
- 사용자는 공란에 직접 답을 입력할 수 있으며, 정답 확인 기능도 지원됩니다.

### 🔐 인증 시스템

- **구글 OAuth 로그인**: 구글 계정으로 간편 로그인
- **이메일/비밀번호 로그인**: 전통적인 로그인 방식
- **게스트 모드**: 로그인 없이도 이용 가능
- **보호된 라우트**: 인증이 필요한 페이지 보호

### 🎯 사용자별 퀴즈 관리

- **로그인 시**: 퀴즈 데이터가 클라우드에 저장되어 어디서든 접근 가능합니다.
- **게스트 모드 시**: 브라우저 로컬 저장소를 사용하여 빠르게 이용할 수 있습니다.

### 🛠️ 개발자 도구

- 데모 데이터 초기화, 삭제, 재설정 기능
- 개발 및 테스트 환경에서 유용한 관리 도구

---

## ⚙️ 문제 변환 조건 예시

- `#`, `##`, `###` 등 특정 **헤더(H 태그)** 이하 내용만 퀴즈화 가능
- 코드 블록 내 일정 부분을 **랜덤 공란 처리**
- 기타 규칙 기반 또는 AI 기반 처리(확장 가능)

---

## 💾 문서 저장 & 불러오기

- 사용자가 변환한 퀴즈 문서는 **로컬(LocalStorage)** 에 자동 저장됩니다.
- 필요 시 언제든지 불러와 이어서 풀 수 있습니다.

---

## 🛠️ 기술 스택

- Framework: **Next.js 15 + React 19 + TypeScript**
- Styling: **Tailwind CSS**
- State: `useState`, `useEffect`, `localStorage` 기반 (향후 React Query 등 도입 가능)
- Parsing: `remark`, `gray-matter` 등 마크다운 파서 (예정)
- Authentication: **Supabase Auth**
- Database: **Supabase PostgreSQL**

---

## 🚧 개발 예정 기능

- ✅ 마크다운 문서 붙여넣기 및 저장
- ✅ 샘플 문서 선택 기능
- ✅ 데모 데이터 관리 도구
- ✅ 공란 문제 생성 및 풀이
- ✅ 구글 OAuth 로그인
- ✅ 이메일/비밀번호 로그인
- ✅ 인증 상태 관리
- ✅ 보호된 라우트
- ⏳ 정답 자동 채점
- ⏳ 사용자별 결과 저장 (향후 로그인 도입 시)
- ⏳ AI 기반 자동 퀴즈 생성 (OpenAI 연동 가능성)

---

## 📌 사용 목적

- 마크다운으로 정리한 학습 자료를 반복 학습용 문제로 활용
- 블로그 글, 강의 노트, 기술 문서 등을 **인터랙티브한 퀴즈 형태로 재사용**

---

## 📄 예시

```markdown
### 자바스크립트의 데이터 타입

자바스크립트에는 원시 타입과 참조 타입이 존재합니다.

- 원시 타입: string, number, boolean, null, undefined, symbol, bigint
- 참조 타입: object, array, function 등
```

## 🎮 데모 데이터 사용법

### 자동 초기화

- 앱을 처음 실행하면 자동으로 5개의 샘플 문서가 LocalStorage에 저장됩니다.
- 히스토리 페이지에서 바로 확인할 수 있습니다.

### 샘플 문서 선택

1. 메인 페이지의 "📋 샘플 문서 선택" 섹션을 확인하세요.
2. 원하는 주제의 샘플을 클릭하면 에디터에 자동으로 내용이 입력됩니다.
3. "퀴즈 생성하기" 버튼을 클릭하여 바로 체험해보세요!

### 개발자 도구

- 메인 페이지 하단의 "🛠️ 개발자 도구"를 사용하여:
  - 📚 데이터 초기화: 데모 데이터가 없을 때 추가
  - 🗑️ 데이터 삭제: 모든 데모 데이터 삭제
  - 🔄 데이터 재설정: 기존 데이터 삭제 후 새로 초기화

## 설치 및 실행

1. 의존성 설치:

```bash
npm install
```

2. 환경변수 설정:
   `.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. 개발 서버 실행:

```bash
npm run dev
```

## 🔐 슈퍼베이스 인증 설정

### 1. 슈퍼베이스 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 URL과 API 키를 확인합니다.

### 2. 구글 OAuth 설정

#### Supabase 설정

1. 슈퍼베이스 대시보드에서 **Authentication** > **Providers**로 이동
2. **Google** 제공자를 활성화
3. Google Cloud Console에서 OAuth 2.0 클라이언트 ID와 시크릿을 생성
4. 리디렉션 URL을 `https://your-project.supabase.co/auth/v1/callback`로 설정

#### Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. API 및 서비스 > 사용자 인증 정보로 이동
4. OAuth 2.0 클라이언트 ID 생성:
   - 애플리케이션 유형: 웹 애플리케이션
   - 승인된 리디렉션 URI: `https://your-project-ref.supabase.co/auth/v1/callback`

### 3. 이메일 인증 설정

1. **Authentication** > **Settings**에서 이메일 템플릿을 커스터마이징
2. **Email confirmations**를 활성화하여 이메일 확인 필요
3. **Secure email change**를 활성화하여 이메일 변경 시 확인 필요

### 4. 데이터베이스 스키마 (선택사항)

사용자별 퀴즈 데이터를 저장하려면 다음 테이블을 생성합니다:

```sql
-- 사용자 프로필 테이블
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 퀴즈 히스토리 테이블
CREATE TABLE quiz_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  questions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_history ENABLE ROW LEVEL SECURITY;

-- 정책 설정
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own quiz history" ON quiz_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz history" ON quiz_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 사용 방법

### 빠른 체험 (추천)

1. 메인 페이지에서 원하는 샘플 문서를 선택
2. "퀴즈 생성하기" 버튼 클릭
3. 바로 퀴즈 체험!

### 직접 입력

1. **게스트 모드**: 바로 메인 페이지에서 Markdown 문서 입력 후 사용
2. **구글 로그인**: `/login` 페이지에서 구글 계정으로 로그인 (선택사항)
3. **이메일 로그인**: `/email-login` 페이지에서 이메일/비밀번호로 로그인 (선택사항)
4. "퀴즈 생성하기" 버튼 클릭하여 퀴즈 생성

## 라이센스

MIT License

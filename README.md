# 📘 Markdown Quiz

**Markdown 문서를 기반으로 학습용 퀴즈를 자동 생성하는 도구입니다.**  
마크다운 문서를 붙여넣기만 하면, 특정 조건에 따라 텍스트가 공란 처리되어 사용자에게 문제 형태로 제공됩니다.

---

## ✨ 주요 기능

### 📝 마크다운 문서 입력

- 사용자가 작성한 `.md` 형식의 문서를 에디터에 붙여넣을 수 있습니다.
- 마크다운 문서는 **브라우저 LocalStorage**에 저장됩니다.

### 📚 변환된 문서 목록 확인

- 저장된 문서는 변환 목록에서 쉽게 확인하고 다시 불러올 수 있습니다.

### 🧠 자동 퀴즈 변환

- 문서 내 **특정 조건에 따라 텍스트가 공란으로 변환**되어 문제로 제공됩니다.
- 사용자는 공란에 직접 답을 입력할 수 있으며, 정답 확인 기능도 지원됩니다.

### 🔐 구글 소셜로그인

- 구글 계정으로 로그인하여 사용자별 퀴즈 관리 기능을 이용할 수 있습니다.

### 🎯 사용자별 퀴즈 관리

- 로그인한 사용자는 자신의 퀴즈 목록을 관리할 수 있습니다.

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

- Framework: **Next.js + TypeScript**
- Styling: **Tailwind CSS**
- State: `useState`, `useEffect`, `localStorage` 기반 (향후 React Query 등 도입 가능)
- Parsing: `remark`, `gray-matter` 등 마크다운 파서 (예정)
- Authentication: **Supabase Auth**
- Database: **Supabase**

---

## 🚧 개발 예정 기능

- ✅ 마크다운 문서 붙여넣기 및 저장
- ✅ 공란 문제 생성 및 풀이
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

## 구글 OAuth 설정

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Authentication > Providers에서 Google 활성화
3. 구글 클라이언트 ID와 비밀번호 입력

### 2. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. API 및 서비스 > 사용자 인증 정보로 이동
4. OAuth 2.0 클라이언트 ID 생성:
   - 애플리케이션 유형: 웹 애플리케이션
   - 승인된 리디렉션 URI: `https://your-project-ref.supabase.co/auth/v1/callback`

### 3. 환경변수 설정

Supabase 프로젝트 설정에서 다음 정보를 복사하여 `.env.local`에 설정:

- `NEXT_PUBLIC_SUPABASE_URL`: 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 익명 키

## 사용 방법

1. `/login` 페이지에서 구글 계정으로 로그인
2. 메인 페이지에서 Markdown 문서 입력
3. "퀴즈 생성하기" 버튼 클릭하여 퀴즈 생성

## 라이센스

MIT License

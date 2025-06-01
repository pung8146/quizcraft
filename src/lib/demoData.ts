export interface DemoQuiz {
  id: string;
  content: string;
  title: string;
  createdAt: string;
}

export const demoQuizzes: DemoQuiz[] = [
  {
    id: "demo001",
    title: "React 기초 개념",
    createdAt: new Date("2024-01-15T10:30:00").toISOString(),
    content: `# React 기초 개념

## React란?

React는 사용자 인터페이스를 구축하기 위한 JavaScript 라이브러리입니다. Facebook에서 개발했으며, 현재는 Meta에서 관리하고 있습니다.

## 주요 특징

### 1. 컴포넌트 기반
- React 애플리케이션은 **컴포넌트**로 구성됩니다
- 각 컴포넌트는 독립적이고 재사용 가능합니다
- 코드의 유지보수성과 재사용성을 높입니다

### 2. 가상 DOM (Virtual DOM)
- 실제 DOM을 메모리에 가상으로 표현한 것입니다
- 상태 변화 시 가상 DOM을 먼저 업데이트합니다
- 이후 실제 DOM과 비교하여 필요한 부분만 업데이트합니다

### 3. 단방향 데이터 흐름
- 데이터는 **상위 컴포넌트에서 하위 컴포넌트**로 흐릅니다
- props를 통해 데이터를 전달합니다
- 예측 가능한 상태 관리가 가능합니다

## 기본 문법

### JSX
\`\`\`jsx
const element = <h1>Hello, World!</h1>;
\`\`\`

### 함수형 컴포넌트
\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

### useState Hook
\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\``,
  },
  {
    id: "demo002",
    title: "JavaScript ES6+ 핵심 기능",
    createdAt: new Date("2024-01-14T14:20:00").toISOString(),
    content: `# JavaScript ES6+ 핵심 기능

## ES6 (ES2015) 주요 기능

### 1. let과 const
\`\`\`javascript
// ES5
var name = "홍길동";

// ES6+
let age = 25;
const PI = 3.14159;
\`\`\`

- **let**: 블록 스코프를 가지는 변수 선언
- **const**: 상수 선언, 재할당 불가

### 2. 화살표 함수 (Arrow Functions)
\`\`\`javascript
// ES5
function add(a, b) {
  return a + b;
}

// ES6+
const add = (a, b) => a + b;

// 복잡한 함수
const processUser = (user) => {
  return {
    ...user,
    fullName: \`\${user.firstName} \${user.lastName}\`
  };
};
\`\`\`

### 3. 템플릿 리터럴 (Template Literals)
\`\`\`javascript
const name = "김철수";
const age = 30;

// ES5
var message = "안녕하세요, " + name + "님! 나이: " + age;

// ES6+
const message = \`안녕하세요, \${name}님! 나이: \${age}\`;
\`\`\`

### 4. 구조 분해 할당 (Destructuring)
\`\`\`javascript
// 배열 구조 분해
const numbers = [1, 2, 3, 4, 5];
const [first, second, ...rest] = numbers;

// 객체 구조 분해
const user = { name: "홍길동", age: 25, city: "서울" };
const { name, age } = user;

// 함수 매개변수
function greet({ name, age }) {
  return \`안녕하세요, \${name}님! (\${age}세)\`;
}
\`\`\`

### 5. 스프레드 연산자 (Spread Operator)
\`\`\`javascript
// 배열 복사 및 합치기
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];

// 객체 복사 및 병합
const user = { name: "김철수", age: 30 };
const updatedUser = { ...user, city: "부산" };
\`\`\`

## ES2017+ 추가 기능

### async/await
\`\`\`javascript
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("사용자 데이터 로드 실패:", error);
  }
}
\`\`\`

### Optional Chaining (ES2020)
\`\`\`javascript
const user = {
  profile: {
    social: {
      twitter: "@user123"
    }
  }
};

// 안전한 접근
const twitterHandle = user?.profile?.social?.twitter;
\`\`\``,
  },
  {
    id: "demo003",
    title: "TypeScript 기본 개념",
    createdAt: new Date("2024-01-13T09:15:00").toISOString(),
    content: `# TypeScript 기본 개념

## TypeScript란?

TypeScript는 Microsoft에서 개발한 **JavaScript의 상위 집합**입니다. JavaScript에 **정적 타입 시스템**을 추가한 언어입니다.

## 왜 TypeScript를 사용하나요?

### 1. 타입 안정성
- 컴파일 시점에 오류를 발견할 수 있습니다
- 런타임 오류를 사전에 방지합니다

### 2. 개발 도구 지원
- 더 나은 **자동완성** 기능
- **리팩토링** 도구 지원
- **인텔리센스** 향상

### 3. 코드 가독성
- 타입 정보가 코드의 **문서화** 역할을 합니다
- 팀 협업 시 코드 이해도가 향상됩니다

## 기본 타입

### 1. 원시 타입
\`\`\`typescript
// 기본 타입
let name: string = "홍길동";
let age: number = 25;
let isStudent: boolean = true;

// 배열
let numbers: number[] = [1, 2, 3, 4, 5];
let names: Array<string> = ["김철수", "이영희"];
\`\`\`

### 2. 객체 타입
\`\`\`typescript
// 인터페이스 정의
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  hobbies?: string[]; // 선택적 속성
}

// 사용
const user: User = {
  id: 1,
  name: "김철수",
  email: "kim@example.com",
  isActive: true
};
\`\`\`

### 3. 함수 타입
\`\`\`typescript
// 함수 시그니처
function calculateArea(width: number, height: number): number {
  return width * height;
}

// 화살표 함수
const greet = (name: string): string => {
  return \`안녕하세요, \${name}님!\`;
};

// 함수 타입 별칭
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const multiply: MathOperation = (a, b) => a * b;
\`\`\`

### 4. 유니언 타입
\`\`\`typescript
// 여러 타입 중 하나
type Status = "loading" | "success" | "error";
type ID = string | number;

function processResult(status: Status) {
  switch (status) {
    case "loading":
      console.log("로딩 중...");
      break;
    case "success":
      console.log("성공!");
      break;
    case "error":
      console.log("오류 발생");
      break;
  }
}
\`\`\`

## 제네릭 (Generics)

\`\`\`typescript
// 제네릭 함수
function identity<T>(arg: T): T {
  return arg;
}

// 사용
const numberResult = identity<number>(42);
const stringResult = identity<string>("Hello");

// 제네릭 인터페이스
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;
\`\`\`

## 타입 가드

\`\`\`typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function processValue(value: unknown) {
  if (isString(value)) {
    // 이 블록에서 value는 string 타입으로 간주됩니다
    console.log(value.toUpperCase());
  }
}
\`\`\``,
  },
  {
    id: "demo004",
    title: "CSS Flexbox 완전 정복",
    createdAt: new Date("2024-01-12T16:45:00").toISOString(),
    content: `# CSS Flexbox 완전 정복

## Flexbox란?

**Flexible Box Layout**의 줄임말로, CSS3에서 도입된 **1차원 레이아웃 방법**입니다. 요소들을 행(row) 또는 열(column)로 배열하는 데 최적화되어 있습니다.

## 기본 개념

### Flex Container와 Flex Items
\`\`\`css
.container {
  display: flex; /* Flex Container가 됩니다 */
}

.item {
  /* Flex Items가 됩니다 */
}
\`\`\`

### 주축(Main Axis)과 교차축(Cross Axis)
- **주축**: flex-direction에 의해 결정되는 기본 축
- **교차축**: 주축에 수직인 축

## Container 속성

### 1. flex-direction
\`\`\`css
.container {
  flex-direction: row;        /* 기본값: 왼쪽에서 오른쪽 */
  flex-direction: row-reverse; /* 오른쪽에서 왼쪽 */
  flex-direction: column;      /* 위에서 아래 */
  flex-direction: column-reverse; /* 아래에서 위 */
}
\`\`\`

### 2. justify-content (주축 정렬)
\`\`\`css
.container {
  justify-content: flex-start;    /* 시작점 정렬 (기본값) */
  justify-content: flex-end;      /* 끝점 정렬 */
  justify-content: center;        /* 중앙 정렬 */
  justify-content: space-between; /* 양끝 정렬 */
  justify-content: space-around;  /* 균등 분할 정렬 */
  justify-content: space-evenly;  /* 균등 간격 정렬 */
}
\`\`\`

### 3. align-items (교차축 정렬)
\`\`\`css
.container {
  align-items: stretch;    /* 늘이기 (기본값) */
  align-items: flex-start; /* 시작점 정렬 */
  align-items: flex-end;   /* 끝점 정렬 */
  align-items: center;     /* 중앙 정렬 */
  align-items: baseline;   /* 텍스트 베이스라인 정렬 */
}
\`\`\`

### 4. flex-wrap
\`\`\`css
.container {
  flex-wrap: nowrap;      /* 줄바꿈 없음 (기본값) */
  flex-wrap: wrap;        /* 줄바꿈 있음 */
  flex-wrap: wrap-reverse; /* 역순 줄바꿨음 */
}
\`\`\`

## Item 속성

### 1. flex-grow
\`\`\`css
.item {
  flex-grow: 0; /* 기본값: 확장하지 않음 */
  flex-grow: 1; /* 사용 가능한 공간을 1의 비율로 확장 */
  flex-grow: 2; /* 사용 가능한 공간을 2의 비율로 확장 */
}
\`\`\`

### 2. flex-shrink
\`\`\`css
.item {
  flex-shrink: 1; /* 기본값: 축소 가능 */
  flex-shrink: 0; /* 축소 불가능 */
}
\`\`\`

### 3. flex-basis
\`\`\`css
.item {
  flex-basis: auto;  /* 기본값: 콘텐츠 크기 */
  flex-basis: 200px; /* 기본 크기 지정 */
  flex-basis: 50%;   /* 퍼센트로 지정 */
}
\`\`\`

### 4. flex (축약형)
\`\`\`css
.item {
  flex: 1;          /* flex: 1 1 0% */
  flex: 0 1 auto;   /* 기본값 */
  flex: 2 1 100px;  /* grow shrink basis */
}
\`\`\`

## 실용적인 레이아웃 예제

### 1. 수평 중앙 정렬
\`\`\`css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
\`\`\`

### 2. 네비게이션 바
\`\`\`css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.nav-links {
  display: flex;
  gap: 2rem;
}
\`\`\`

### 3. 카드 그리드
\`\`\`css
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 300px; /* 최소 300px, 확장 가능 */
}
\`\`\`

### 4. Sticky Footer
\`\`\`css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1; /* 남은 공간을 모두 차지 */
}
\`\`\``,
  },
  {
    id: "demo005",
    title: "Node.js 기초와 Express.js",
    createdAt: new Date("2024-01-11T11:20:00").toISOString(),
    content: `# Node.js 기초와 Express.js

## Node.js란?

**Node.js**는 Chrome V8 JavaScript 엔진으로 빌드된 **JavaScript 런타임**입니다. 서버 사이드에서 JavaScript를 실행할 수 있게 해줍니다.

## Node.js의 특징

### 1. 비동기 I/O
- **논블로킹 I/O** 방식을 사용합니다
- 단일 스레드로 높은 동시성을 처리합니다
- 콜백, Promise, async/await를 통한 비동기 처리

### 2. 이벤트 주도
- **이벤트 루프**를 기반으로 동작합니다
- 이벤트가 발생하면 해당 콜백이 실행됩니다

### 3. NPM (Node Package Manager)
- 세계 최대의 오픈소스 라이브러리 생태계
- \`package.json\`으로 의존성 관리

## 기본 모듈 시스템

### CommonJS (require/module.exports)
\`\`\`javascript
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = { add, subtract };

// app.js
const { add, subtract } = require('./math');

console.log(add(5, 3)); // 8
console.log(subtract(5, 3)); // 2
\`\`\`

### ES Modules (import/export)
\`\`\`javascript
// math.mjs
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// app.mjs
import { add, subtract } from './math.mjs';

console.log(add(5, 3)); // 8
\`\`\`

## 내장 모듈

### File System (fs)
\`\`\`javascript
const fs = require('fs');

// 파일 읽기 (비동기)
fs.readFile('data.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 파일 읽기 (동기)
try {
  const data = fs.readFileSync('data.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error(err);
}

// Promise 기반
const fsPromises = require('fs').promises;

async function readFileAsync() {
  try {
    const data = await fsPromises.readFile('data.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
\`\`\`

### HTTP 서버
\`\`\`javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>안녕하세요, Node.js!</h1>');
});

server.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});
\`\`\`

## Express.js 기초

### 설치 및 기본 설정
\`\`\`bash
npm init -y
npm install express
\`\`\`

\`\`\`javascript
const express = require('express');
const app = express();
const PORT = 3000;

// 미들웨어
app.use(express.json()); // JSON 파싱
app.use(express.static('public')); // 정적 파일 제공

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello Express!');
});

// 서버 시작
app.listen(PORT, () => {
  console.log(\`서버가 http://localhost:\${PORT}에서 실행 중입니다.\`);
});
\`\`\`

### 라우팅
\`\`\`javascript
// GET 요청
app.get('/users', (req, res) => {
  res.json({ message: '사용자 목록' });
});

// POST 요청
app.post('/users', (req, res) => {
  const userData = req.body;
  res.status(201).json({ message: '사용자 생성됨', user: userData });
});

// URL 매개변수
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ message: \`사용자 ID: \${userId}\` });
});

// 쿼리 매개변수
app.get('/search', (req, res) => {
  const { q, page = 1 } = req.query;
  res.json({ query: q, page: parseInt(page) });
});
\`\`\`

### 미들웨어
\`\`\`javascript
// 로깅 미들웨어
app.use((req, res, next) => {
  console.log(\`\${new Date().toISOString()} - \${req.method} \${req.path}\`);
  next(); // 다음 미들웨어로 진행
});

// 인증 미들웨어
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다' });
  }
  
  // 토큰 검증 로직
  req.user = { id: 1, name: '홍길동' }; // 예시
  next();
};

// 보호된 라우트
app.get('/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});
\`\`\`

### 에러 핸들링
\`\`\`javascript
// 404 에러 핸들러
app.use((req, res) => {
  res.status(404).json({ error: '페이지를 찾을 수 없습니다' });
});

// 일반 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 내부 오류' });
});
\`\`\``,
  },
];

export const initializeDemoData = (): void => {
  if (typeof window === "undefined") return; // 서버 사이드에서는 실행하지 않음

  // 기존 데모 데이터가 있는지 확인
  const existingDemo = localStorage.getItem("demo-initialized");
  if (existingDemo === "true") return;

  // 데모 데이터 저장
  demoQuizzes.forEach((quiz) => {
    localStorage.setItem(`quiz-${quiz.id}`, quiz.content);
    localStorage.setItem(
      `quiz-${quiz.id}-meta`,
      JSON.stringify({
        createdAt: quiz.createdAt,
        title: quiz.title,
      })
    );
  });

  // 초기화 완료 표시
  localStorage.setItem("demo-initialized", "true");
  console.log("📚 데모 데이터가 초기화되었습니다!");
};

export const clearDemoData = (): void => {
  if (typeof window === "undefined") return;

  demoQuizzes.forEach((quiz) => {
    localStorage.removeItem(`quiz-${quiz.id}`);
    localStorage.removeItem(`quiz-${quiz.id}-meta`);
  });

  localStorage.removeItem("demo-initialized");
  console.log("🗑️ 데모 데이터가 삭제되었습니다!");
};

export const resetDemoData = (): void => {
  clearDemoData();
  initializeDemoData();
};

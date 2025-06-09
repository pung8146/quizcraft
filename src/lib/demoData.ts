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

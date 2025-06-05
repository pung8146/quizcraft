export interface SharedDoc {
  id: string;
  content: string;
  title: string;
  author: string;
  createdAt: string;
  category: string;
  likes: number;
  views: number;
  tags: string[];
}

export const sharedDocs: SharedDoc[] = [
  {
    id: "shared001",
    title: "Python 데이터 분석 기초",
    author: "김데이터",
    category: "프로그래밍",
    createdAt: new Date("2024-01-20T15:30:00").toISOString(),
    likes: 45,
    views: 156,
    tags: ["Python", "데이터분석", "pandas", "numpy"],
    content: `# Python 데이터 분석 기초

## 데이터 분석이란?

데이터 분석은 **원시 데이터를 수집, 정리, 해석**하여 의미 있는 정보와 통찰을 도출하는 과정입니다.

## 주요 라이브러리

### 1. NumPy
- **수치 계산**을 위한 핵심 라이브러리
- 다차원 배열 객체와 배열 처리 함수들을 제공합니다
- 빠른 연산 속도가 특징입니다

### 2. pandas
- **데이터 조작과 분석**을 위한 라이브러리
- DataFrame과 Series 객체를 제공합니다
- 데이터 읽기, 쓰기, 변형, 집계 등이 가능합니다

### 3. Matplotlib
- **데이터 시각화**를 위한 라이브러리
- 다양한 차트와 그래프를 생성할 수 있습니다
- 정적, 동적, 대화형 시각화를 지원합니다

## 기본 사용법

### DataFrame 생성
\`\`\`python
import pandas as pd

data = {
    'name': ['홍길동', '김철수', '이영희'],
    'age': [25, 30, 28],
    'city': ['서울', '부산', '대구']
}

df = pd.DataFrame(data)
print(df)
\`\`\`

### 데이터 읽기
\`\`\`python
# CSV 파일 읽기
df = pd.read_csv('data.csv')

# Excel 파일 읽기
df = pd.read_excel('data.xlsx')
\`\`\`

### 기본 통계 정보
\`\`\`python
# 기본 정보 확인
df.info()

# 통계 요약
df.describe()

# 상위 5개 행
df.head()
\`\`\`

## 데이터 전처리

### 결측값 처리
\`\`\`python
# 결측값 확인
df.isnull().sum()

# 결측값 제거
df.dropna()

# 결측값 채우기
df.fillna(0)
\`\`\`

### 데이터 필터링
\`\`\`python
# 조건에 맞는 데이터 선택
adult_users = df[df['age'] >= 30]

# 여러 조건
seoul_adults = df[(df['city'] == '서울') & (df['age'] >= 30)]
\`\`\``,
  },
  {
    id: "shared002",
    title: "웹 개발 보안 가이드",
    author: "박보안",
    category: "보안",
    createdAt: new Date("2024-01-19T11:20:00").toISOString(),
    likes: 38,
    views: 89,
    tags: ["보안", "웹개발", "HTTPS", "인증"],
    content: `# 웹 개발 보안 가이드

## 웹 보안의 중요성

웹 애플리케이션 보안은 **사용자 데이터 보호**와 **시스템 안정성**을 위해 필수적입니다.

## 주요 보안 위협

### 1. SQL 인젝션 (SQL Injection)
- **악성 SQL 구문**을 삽입하여 데이터베이스를 조작하는 공격
- 입력값 검증과 **파라미터화된 쿼리** 사용으로 방지

### 2. XSS (Cross-Site Scripting)
- 웹페이지에 **악성 스크립트**를 삽입하는 공격
- 입력값 이스케이프와 **CSP 헤더** 설정으로 방지

### 3. CSRF (Cross-Site Request Forgery)
- 사용자의 의지와 무관하게 **요청을 위조**하는 공격
- **CSRF 토큰** 사용으로 방지

## 보안 모범 사례

### HTTPS 사용
\`\`\`
모든 통신은 HTTPS를 통해 암호화해야 합니다
- 데이터 전송 중 암호화
- 중간자 공격 방지
- SEO 및 브라우저 신뢰도 향상
\`\`\`

### 인증과 권한 관리
\`\`\`
강력한 인증 시스템 구축:
- 복잡한 비밀번호 정책
- 다단계 인증 (MFA)
- 세션 관리
- 권한 기반 접근 제어
\`\`\`

### 입력값 검증
\`\`\`javascript
// 클라이언트 측 검증
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 서버 측에서도 반드시 재검증
\`\`\`

### 보안 헤더 설정
\`\`\`
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
\`\`\`

## 정기적인 보안 점검

### 1. 의존성 업데이트
- 라이브러리와 프레임워크를 최신 버전으로 유지
- 알려진 취약점 패치 적용

### 2. 보안 테스트
- **침투 테스트** 실시
- **코드 리뷰** 수행
- **자동화된 보안 스캔** 도구 활용

### 3. 로그 모니터링
- 의심스러운 활동 감지
- 실시간 알림 시스템 구축
- 정기적인 로그 분석`,
  },
  {
    id: "shared003",
    title: "UI/UX 디자인 원칙",
    author: "최디자인",
    category: "디자인",
    createdAt: new Date("2024-01-18T16:45:00").toISOString(),
    likes: 52,
    views: 203,
    tags: ["UI", "UX", "디자인", "사용성"],
    content: `# UI/UX 디자인 원칙

## UI와 UX의 차이

### UI (User Interface)
- 사용자가 **직접 상호작용하는 화면** 요소들
- 버튼, 메뉴, 레이아웃 등의 **시각적 디자인**

### UX (User Experience)  
- 사용자가 제품을 사용하면서 느끼는 **전체적인 경험**
- 사용성, 접근성, 만족도 등을 포함

## 핵심 디자인 원칙

### 1. 일관성 (Consistency)
- 전체 인터페이스에서 **동일한 패턴** 유지
- 색상, 타이포그래피, 레이아웃의 일관성
- 사용자의 학습 부담을 줄입니다

### 2. 명확성 (Clarity)
- **명확하고 이해하기 쉬운** 인터페이스
- 모호함을 제거하고 직관적인 설계
- 적절한 라벨링과 아이콘 사용

### 3. 피드백 (Feedback)
- 사용자 행동에 대한 **즉각적인 응답**
- 로딩 상태, 성공/실패 메시지
- 시스템 상태를 명확히 전달

### 4. 사용자 제어 (User Control)
- 사용자가 **자신의 행동을 제어**할 수 있게 함
- 되돌리기, 취소 기능 제공
- 강제적인 액션을 피함

## 사용성 원칙

### 접근성 (Accessibility)
\`\`\`
모든 사용자가 이용할 수 있는 디자인:
- 색상만으로 정보를 전달하지 않기
- 적절한 대비율 유지
- 키보드 네비게이션 지원
- 스크린 리더 호환성
\`\`\`

### 반응형 디자인
\`\`\`
다양한 디바이스에서의 최적화:
- 모바일 우선 설계
- 유연한 그리드 시스템
- 터치 친화적인 인터페이스
- 적절한 터치 타겟 크기
\`\`\`

### 성능 최적화
\`\`\`
빠른 로딩과 부드러운 상호작용:
- 이미지 최적화
- 최소한의 HTTP 요청
- 효율적인 애니메이션
- 프로그레시브 로딩
\`\`\`

## 사용자 조사 방법

### 1. 사용자 인터뷰
- **실제 사용자의 니즈** 파악
- 페르소나 개발의 기초 자료
- 정성적 데이터 수집

### 2. 사용성 테스트
- **실제 사용 과정** 관찰
- 문제점 발견과 개선점 도출
- 프로토타입 검증

### 3. A/B 테스트
- **두 가지 버전을 비교** 테스트
- 데이터 기반 의사결정
- 지속적인 개선

## 디자인 시스템

### 컴포넌트 라이브러리
- **재사용 가능한 UI 요소**들
- 일관성 있는 디자인 유지
- 개발 효율성 향상

### 스타일 가이드
- 색상 팔레트
- 타이포그래피 규칙
- 간격과 레이아웃 가이드라인`,
  },
  {
    id: "shared004",
    title: "Machine Learning 입문",
    author: "이머신",
    category: "AI/ML",
    createdAt: new Date("2024-01-17T13:10:00").toISOString(),
    likes: 67,
    views: 234,
    tags: ["머신러닝", "AI", "Python", "scikit-learn"],
    content: `# Machine Learning 입문

## 머신러닝이란?

머신러닝은 **컴퓨터가 데이터로부터 패턴을 학습**하여 예측이나 결정을 내리는 기술입니다.

## 머신러닝 유형

### 1. 지도학습 (Supervised Learning)
- **정답이 있는 데이터**로 학습
- 분류(Classification)와 회귀(Regression)
- 예: 이메일 스팸 분류, 주택 가격 예측

### 2. 비지도학습 (Unsupervised Learning)
- **정답이 없는 데이터**에서 패턴 발견
- 클러스터링, 차원 축소
- 예: 고객 세분화, 추천 시스템

### 3. 강화학습 (Reinforcement Learning)
- **보상과 벌점**을 통해 학습
- 게임 AI, 자율주행 등
- 예: 알파고, 자동차 자율주행

## 주요 알고리즘

### 선형 회귀 (Linear Regression)
\`\`\`python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

# 데이터 분할
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# 모델 생성 및 학습
model = LinearRegression()
model.fit(X_train, y_train)

# 예측
predictions = model.predict(X_test)
\`\`\`

### 의사결정 트리 (Decision Tree)
\`\`\`python
from sklearn.tree import DecisionTreeClassifier

# 분류 모델 생성
classifier = DecisionTreeClassifier(max_depth=5)
classifier.fit(X_train, y_train)

# 예측 및 평가
accuracy = classifier.score(X_test, y_test)
print(f"정확도: {accuracy:.2f}")
\`\`\`

### 랜덤 포레스트 (Random Forest)
\`\`\`python
from sklearn.ensemble import RandomForestClassifier

# 앙상블 모델
rf_model = RandomForestClassifier(n_estimators=100)
rf_model.fit(X_train, y_train)

# 특성 중요도 확인
feature_importance = rf_model.feature_importances_
\`\`\`

## 데이터 전처리

### 스케일링
\`\`\`python
from sklearn.preprocessing import StandardScaler

# 표준화
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
\`\`\`

### 인코딩
\`\`\`python
from sklearn.preprocessing import LabelEncoder

# 범주형 데이터 인코딩
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)
\`\`\`

## 모델 평가

### 분류 모델 평가
\`\`\`python
from sklearn.metrics import accuracy_score, precision_score, recall_score

accuracy = accuracy_score(y_test, predictions)
precision = precision_score(y_test, predictions, average='weighted')
recall = recall_score(y_test, predictions, average='weighted')
\`\`\`

### 회귀 모델 평가
\`\`\`python
from sklearn.metrics import mean_squared_error, r2_score

mse = mean_squared_error(y_test, predictions)
r2 = r2_score(y_test, predictions)
\`\`\`

## 과적합 방지

### 교차 검증
\`\`\`python
from sklearn.model_selection import cross_val_score

# K-fold 교차 검증
scores = cross_val_score(model, X, y, cv=5)
print(f"평균 점수: {scores.mean():.2f}")
\`\`\`

### 정규화
- **L1 정규화 (Lasso)**: 특성 선택 효과
- **L2 정규화 (Ridge)**: 가중치 크기 제한
- **Elastic Net**: L1 + L2 조합`,
  },
  {
    id: "shared005",
    title: "블록체인 기초 개념",
    author: "김블록",
    category: "블록체인",
    createdAt: new Date("2024-01-16T10:00:00").toISOString(),
    likes: 29,
    views: 78,
    tags: ["블록체인", "암호화폐", "분산원장", "스마트컨트랙트"],
    content: `# 블록체인 기초 개념

## 블록체인이란?

블록체인은 **분산된 디지털 원장 기술**입니다. 거래 데이터를 블록 단위로 연결하여 체인 형태로 저장합니다.

## 핵심 특징

### 1. 탈중앙화 (Decentralization)
- **중앙 관리자가 없는** 분산 네트워크
- 모든 참여자가 동일한 데이터를 보유
- 단일 장애점(SPOF) 제거

### 2. 불변성 (Immutability)
- 한번 기록된 데이터는 **변경이 매우 어려움**
- 암호학적 해시 함수로 보안 강화
- 데이터 무결성 보장

### 3. 투명성 (Transparency)
- 모든 거래가 **공개적으로 검증 가능**
- 네트워크 참여자 누구나 확인 가능
- 신뢰성 증대

## 블록체인 구조

### 블록 구성 요소
\`\`\`
블록 헤더:
- 이전 블록 해시
- 머클 루트
- 타임스탬프
- 논스 (Nonce)

블록 바디:
- 거래 데이터
- 트랜잭션 목록
\`\`\`

### 해시 함수
\`\`\`
특징:
- 입력값이 조금만 바뀌어도 출력값이 크게 변함
- 역산이 불가능
- 고정된 길이의 출력
- SHA-256이 대표적
\`\`\`

## 합의 알고리즘

### 1. 작업 증명 (Proof of Work)
- **계산 파워**를 통한 합의
- 비트코인에서 사용
- 높은 에너지 소비가 단점

### 2. 지분 증명 (Proof of Stake)
- **보유 지분**에 따른 검증 권한
- 이더리움 2.0에서 채택
- 에너지 효율적

### 3. 위임 지분 증명 (DPoS)
- **대표자 선출** 방식
- 빠른 처리 속도
- EOS, TRON 등에서 사용

## 스마트 컨트랙트

### 개념
- **자동 실행되는 계약**
- 조건 충족 시 자동으로 실행
- 중개자 없이 거래 가능

### 이더리움 예시
\`\`\`solidity
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private storedData;
    
    function set(uint256 x) public {
        storedData = x;
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}
\`\`\`

## 블록체인 활용 분야

### 1. 암호화폐
- 디지털 화폐 시스템
- P2P 거래
- 금융 혁신

### 2. 공급망 관리
- 제품 이력 추적
- 위조품 방지
- 투명한 유통 과정

### 3. 신원 관리
- 디지털 신원 증명
- 개인정보 보호
- 중앙화된 인증 기관 대체

### 4. 의료 기록
- 환자 데이터 보안
- 병원 간 정보 공유
- 개인정보 통제권 강화

## 한계와 과제

### 확장성 문제
- **트랜잭션 처리 속도** 제한
- 네트워크 혼잡 시 지연
- 레이어 2 솔루션으로 해결 시도

### 에너지 소비
- 작업 증명 방식의 높은 전력 소모
- 환경 문제 제기
- 대안 합의 알고리즘 연구

### 규제 이슈
- 각국의 상이한 규제 정책
- 법적 불확실성
- 규제 샌드박스 필요성`,
  },
];

export const getSharedDocsByCategory = (category?: string): SharedDoc[] => {
  if (!category) return sharedDocs;
  return sharedDocs.filter((doc) => doc.category === category);
};

export const getSharedDocsByTag = (tag: string): SharedDoc[] => {
  return sharedDocs.filter((doc) =>
    doc.tags.some((docTag) => docTag.toLowerCase().includes(tag.toLowerCase()))
  );
};

export const searchSharedDocs = (query: string): SharedDoc[] => {
  const searchTerm = query.toLowerCase();
  return sharedDocs.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.content.toLowerCase().includes(searchTerm) ||
      doc.author.toLowerCase().includes(searchTerm) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
  );
};

export const getPopularSharedDocs = (limit: number = 5): SharedDoc[] => {
  return [...sharedDocs].sort((a, b) => b.likes - a.likes).slice(0, limit);
};

export const getRecentSharedDocs = (limit: number = 5): SharedDoc[] => {
  return [...sharedDocs]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
};

export const getAllCategories = (): string[] => {
  const categories = new Set(sharedDocs.map((doc) => doc.category));
  return Array.from(categories).sort();
};

export const getAllTags = (): string[] => {
  const tags = new Set(sharedDocs.flatMap((doc) => doc.tags));
  return Array.from(tags).sort();
};

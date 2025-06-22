export interface PlaceholderTemplate {
  content: string;
}

export const quizPlaceholders: PlaceholderTemplate[] = [
  {
    content: `리액트 공식문서 
    
Hello World
These docs are old and won’t be updated. Go to react.dev for the new React docs.

See Quick Start for an introduction to React.

가장 단순한 React 예시는 다음과 같이 생겼습니다.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<h1>Hello, world!</h1>);
위 코드는 페이지에 “Hello, world!”라는 제목을 보여줍니다.

CodePen에서 실행하기

온라인 에디터로 열어보려면 상단의 링크를 클릭하세요. 코드를 자유롭게 수정하고, 결과가 어떻게 변하는지 관찰해보세요. 이 안내서의 거의 모든 페이지에서는 이런 형태로 수정 가능한 예시를 함께 제공합니다.

이 안내서를 읽는 방법
이 안내서에서 우리는 엘리먼트와 컴포넌트라고 불리는 React 앱의 구성 블록들에 대해 살펴볼 것입니다. 이들을 숙달하고 나면 재사용 가능한 조각들로부터 복잡한 앱을 만들 수도 있습니다.

팁

이 안내서는 개념들을 단계적으로 배우길 원하는 사람들을 대상으로 합니다. 실습을 통해 배우길 원한다면, 실전 튜토리얼을 확인하세요. 이 안내서와 실전 튜토리얼은 상호보완적인 내용을 담고 있습니다.

이 페이지는 React 주요 개념에 대한 단계별 안내서의 첫 번째 장입니다. 내비게이션 사이드바에서 모든 장의 목록을 확인할 수 있습니다. 모바일 기기에서 읽고 있다면, 화면 오른쪽 하단 끝에 있는 버튼을 클릭하여 내비게이션에 접근할 수 있습니다.

이 안내서의 모든 장들은 이전 장의 내용을 토대로 작성되었습니다. 사이드바에 보이는 순서대로 “주요 개념” 안내서의 장들을 읽으면 React의 거의 모든 내용을 익힐 수 있습니다. “JSX 소개”가 바로 이 다음 장입니다.

지식수준 가정
React는 JavaScript 라이브러리이며, 따라서 JavaScript 언어에 대한 기본적인 이해가 필요합니다. 아직 자신이 없다면, JavaScript 튜토리얼 살펴보기를 통해 자신의 지식수준을 확인해보길 권장드리며 이를 통해 길을 잃지 않고 이 안내서를 잘 따라올 수 있게 될 것입니다. 30분에서 1시간 가량 소요되지만, 결과적으로 더 이상 React와 JavaScript를 동시에 배운다는 느낌을 받지 않을 수 있습니다.


    `,
  },
];

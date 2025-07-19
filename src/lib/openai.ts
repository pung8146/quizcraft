import OpenAI from "openai";

// OpenAI 클라이언트를 지연 초기화하여 빌드 타임 오류 방지
let openaiClient: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.");
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

export interface QuizQuestion {
  type:
    | "multiple-choice"
    | "true-false"
    | "fill-in-the-blank"
    | "sentence-completion";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export interface GeneratedQuiz {
  summary: string;
  keyPoints: string[];
  questions: QuizQuestion[];
}

export interface TitleAndTag {
  title: string;
  tag: string;
}

interface QuizOptions {
  types: {
    multipleChoice: boolean;
    trueOrFalse: boolean;
    fillInBlank: boolean;
    sentenceCompletion: boolean;
  };
  questionCount: number;
}

/**
 * 문서 내용을 분석해서 적절한 제목과 태그를 생성하는 함수
 */
export async function generateTitleAndTag(
  content: string
): Promise<TitleAndTag> {
  // 내용이 너무 길면 처음 2000자와 마지막 500자만 사용 (제목 생성에 최적화)
  let analysisContent = content;
  if (content.length > 3000) {
    const firstPart = content.substring(0, 2000);
    const lastPart = content.substring(content.length - 500);
    analysisContent = firstPart + "\n\n[...중략...]\n\n" + lastPart;
    console.log(
      `📏 내용 길이 조정: ${content.length}자 → ${analysisContent.length}자`
    );
  }

  const prompt = `
다음 텍스트를 분석하여 내용에 기반한 의미있는 제목과 태그를 생성해주세요.

텍스트:
${analysisContent}

요구사항:
1. 제목: 
   - 문서의 핵심 내용과 주요 주제를 구체적으로 나타내는 제목
   - 단순한 원본 제목이 아닌, 내용을 읽고 이해한 후 정리한 제목
   - 15-40자 정도의 구체적이고 설명적인 제목
   - 읽는 사람이 어떤 내용인지 바로 알 수 있도록 작성
   
2. 태그: 
   - 문서의 분야나 카테고리 (예: 기술, 건강, 경제, 과학, 교육, 생활, 문화, 역사, 상식 등)

다음 JSON 형식으로만 응답해주세요:
{
  "title": "내용 기반 구체적 제목",
  "tag": "카테고리"
}

예시:
- 리액트 훅스 사용법에 대한 글 → {"title": "React Hooks를 활용한 상태 관리와 생명주기 최적화", "tag": "기술"}
- 당뇨병 예방법에 대한 글 → {"title": "당뇨병 예방을 위한 식단 관리와 운동 방법", "tag": "건강"}
- 투자 전략에 대한 글 → {"title": "초보자를 위한 분산투자와 리스크 관리 전략", "tag": "경제"}
- 환경 보호 방법에 대한 글 → {"title": "일상에서 실천할 수 있는 탄소 배출 줄이기 방법", "tag": "환경"}

중요: 원본 웹페이지의 제목을 그대로 사용하지 말고, 텍스트 내용을 분석하여 새로운 제목을 만들어주세요.
`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            "당신은 콘텐츠 큐레이션 전문가입니다. 주어진 텍스트의 내용을 깊이 분석하여, 원본 제목과는 다른 내용 중심의 의미있는 제목을 만들어야 합니다. 단순히 원본 제목을 재사용하지 말고, 텍스트에서 다루는 핵심 주제, 방법론, 인사이트를 바탕으로 구체적이고 유용한 제목을 생성하세요. 응답은 반드시 유효한 JSON 형식으로만 제공하세요.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // 더 일관된 결과를 위해 낮은 temperature 사용
      max_tokens: 200,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("OpenAI API에서 응답을 받지 못했습니다.");
    }

    // 마크다운에서 JSON 추출
    let jsonString = responseContent;
    if (responseContent.includes("```json")) {
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim();
      }
    } else if (responseContent.includes("```")) {
      const jsonMatch = responseContent.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim();
      }
    }

    const result = JSON.parse(jsonString) as TitleAndTag;

    // 데이터 검증
    if (!result.title || !result.tag) {
      throw new Error("생성된 제목/태그 데이터가 올바르지 않습니다.");
    }

    return result;
  } catch (error) {
    console.error("제목/태그 생성 오류:", error);

    // 오류 발생시 기본값 반환
    return {
      title: `퀴즈 - ${new Date().toLocaleDateString("ko-KR")}`,
      tag: "일반",
    };
  }
}

export async function generateQuizFromContent(
  content: string,
  options?: QuizOptions
): Promise<GeneratedQuiz> {
  // 기본 옵션 설정
  const defaultOptions: QuizOptions = {
    types: {
      multipleChoice: true,
      trueOrFalse: true,
      fillInBlank: true,
      sentenceCompletion: true,
    },
    questionCount: 5,
  };

  const quizOptions = options || defaultOptions;

  // 선택된 문제 유형들
  const selectedTypes = [];
  if (quizOptions.types.multipleChoice) selectedTypes.push("객관식");
  if (quizOptions.types.trueOrFalse) selectedTypes.push("참/거짓");
  if (quizOptions.types.fillInBlank) selectedTypes.push("빈칸 추론");
  if (quizOptions.types.sentenceCompletion) selectedTypes.push("문장 완성");

  const typeInstructions = [];
  if (quizOptions.types.multipleChoice) {
    typeInstructions.push(`
    {
      "type": "multiple-choice",
      "question": "객관식 문제",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correctAnswer": 0,
      "explanation": "정답 설명"
    }`);
  }
  if (quizOptions.types.trueOrFalse) {
    typeInstructions.push(`
    {
      "type": "true-false",
      "question": "참/거짓 문제",
      "correctAnswer": true,
      "explanation": "정답 설명"
    }`);
  }
  if (quizOptions.types.fillInBlank) {
    typeInstructions.push(`
    {
      "type": "fill-in-the-blank",
      "question": "다음 문장의 빈칸을 채워주세요: _____는 중요한 개념입니다.",
      "correctAnswer": "정답",
      "explanation": "정답 설명"
    }`);
  }
  if (quizOptions.types.sentenceCompletion) {
    typeInstructions.push(`
    {
      "type": "sentence-completion",
      "question": "주어진 단어들을 사용하여 올바른 문장을 만들어주세요: '당신의 이름은 무엇입니까'를 영어로 하면?",
      "options": ["name", "what", "your", "my", "daddy"],
      "correctAnswer": "what your name",
      "explanation": "정답 설명"
    }`);
  }

  const prompt = `
다음 텍스트를 분석하여 요약, 핵심 포인트, 그리고 지정된 유형의 퀴즈를 생성해주세요.

텍스트:
${content}

퀴즈 생성 요구사항:
- 총 문제 개수: ${quizOptions.questionCount}개
- 포함할 문제 유형: ${selectedTypes.join(", ")}

다음 JSON 형식으로만 응답해주세요 (마크다운이나 다른 텍스트 없이 순수 JSON만):
{
  "summary": "텍스트의 핵심 내용을 3-4문장으로 요약",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "questions": [${typeInstructions.join(",")}
  ]
}

중요한 규칙:
- 총 ${
    quizOptions.questionCount
  }개의 문제를 생성하되, 선택된 유형(${selectedTypes.join(
    ", "
  )})만 사용해주세요.
- 각 유형이 골고루 분배되도록 해주세요.
- 모든 문제는 한국어로 작성해주세요.
- correctAnswer는 객관식의 경우 인덱스(0,1,2,3), 참/거짓의 경우 boolean, 빈칸추론의 경우 문자열로 설정해주세요.
- 문장 완성 문제의 경우:
  * question: "주어진 단어들을 사용하여 올바른 문장을 만들어주세요: [문제 설명]"
  * options: 사용할 수 있는 단어들의 배열 (예: ["name", "what", "your", "my", "daddy"])
  * correctAnswer: 올바른 문장 (예: "what your name")
  * explanation: 왜 그 문장이 정답인지 설명
`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            "당신은 교육 전문가입니다. 주어진 텍스트를 분석하여 효과적인 학습 자료와 퀴즈를 생성합니다. 응답은 반드시 유효한 JSON 형식으로만 제공하세요. 마크다운 코드 블록이나 다른 텍스트를 포함하지 마세요.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error("OpenAI API에서 응답을 받지 못했습니다.");
    }

    // 마크다운에서 JSON 추출
    let jsonString = responseContent;

    // ```json으로 감싸진 경우 제거
    if (responseContent.includes("```json")) {
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim();
      }
    }
    // ```로만 감싸진 경우 제거
    else if (responseContent.includes("```")) {
      const jsonMatch = responseContent.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim();
      }
    }

    console.log("추출된 JSON:", jsonString.substring(0, 200) + "...");

    // JSON 파싱
    const result = JSON.parse(jsonString) as GeneratedQuiz;

    // 데이터 검증
    if (!result.summary || !result.keyPoints || !result.questions) {
      throw new Error("생성된 퀴즈 데이터가 올바르지 않습니다.");
    }

    return result;
  } catch (error) {
    console.error("퀴즈 생성 오류:", error);
    throw new Error("퀴즈 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
}

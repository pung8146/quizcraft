import OpenAI from 'openai';

// OpenAI 클라이언트를 지연 초기화하여 빌드 타임 오류 방지
let openaiClient: OpenAI | null = null;

const getOpenAIClient = (): OpenAI => {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
};

export interface QuizQuestion {
  type: 'multiple-choice' | 'true-false' | 'fill-in-the-blank';
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

export async function generateQuizFromContent(
  content: string
): Promise<GeneratedQuiz> {
  const prompt = `
다음 텍스트를 분석하여 요약, 핵심 포인트, 그리고 다양한 유형의 퀴즈를 생성해주세요.

텍스트:
${content}

다음 JSON 형식으로만 응답해주세요 (마크다운이나 다른 텍스트 없이 순수 JSON만):
{
  "summary": "텍스트의 핵심 내용을 3-4문장으로 요약",
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"],
  "questions": [
    {
      "type": "multiple-choice",
      "question": "객관식 문제",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correctAnswer": 0,
      "explanation": "정답 설명"
    },
    {
      "type": "true-false",
      "question": "참/거짓 문제",
      "correctAnswer": true,
      "explanation": "정답 설명"
    },
    {
      "type": "fill-in-the-blank",
      "question": "다음 문장의 빈칸을 채워주세요: _____는 중요한 개념입니다.",
      "correctAnswer": "정답",
      "explanation": "정답 설명"
    }
  ]
}

- 객관식 문제는 2-3개, 참/거짓 문제는 2-3개, 빈칸 추론 문제는 2-3개 생성해주세요.
- 모든 문제는 한국어로 작성해주세요.
- correctAnswer는 객관식의 경우 인덱스(0,1,2,3), 참/거짓의 경우 boolean, 빈칸추론의 경우 문자열로 설정해주세요.
`;

  try {
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'system',
          content:
            '당신은 교육 전문가입니다. 주어진 텍스트를 분석하여 효과적인 학습 자료와 퀴즈를 생성합니다. 응답은 반드시 유효한 JSON 형식으로만 제공하세요. 마크다운 코드 블록이나 다른 텍스트를 포함하지 마세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('OpenAI API에서 응답을 받지 못했습니다.');
    }

    // 마크다운에서 JSON 추출
    let jsonString = responseContent;

    // ```json으로 감싸진 경우 제거
    if (responseContent.includes('```json')) {
      const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim();
      }
    }
    // ```로만 감싸진 경우 제거
    else if (responseContent.includes('```')) {
      const jsonMatch = responseContent.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim();
      }
    }

    console.log('추출된 JSON:', jsonString.substring(0, 200) + '...');

    // JSON 파싱
    const result = JSON.parse(jsonString) as GeneratedQuiz;

    // 데이터 검증
    if (!result.summary || !result.keyPoints || !result.questions) {
      throw new Error('생성된 퀴즈 데이터가 올바르지 않습니다.');
    }

    return result;
  } catch (error) {
    console.error('퀴즈 생성 오류:', error);
    throw new Error('퀴즈 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

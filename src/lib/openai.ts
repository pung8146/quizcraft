import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

다음 JSON 형식으로 응답해주세요:
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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            '당신은 교육 전문가입니다. 주어진 텍스트를 분석하여 효과적인 학습 자료와 퀴즈를 생성합니다.',
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

    // JSON 파싱
    const result = JSON.parse(responseContent) as GeneratedQuiz;

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

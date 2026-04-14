export const AGE_GROUP_DESCRIPTIONS = {
  '10s': {
    label: '10대 (중·고등학생)',
    style: '쉽고 친근한 언어 사용, 최신 트렌드와 연결, 짧고 임팩트 있는 문장, 유머 OK',
    difficulty: '쉬움 위주 (difficulty 1-2)',
    questionStyle: '흥미 유발, "~가 맞으면 O, 틀리면 X", 연예/스포츠/K팝 연결 선호',
  },
  '20s': {
    label: '20대 (대학생·사회초년생)',
    style: '자연스러운 현대 언어, 사회적 맥락 연결, 배경지식 활용',
    difficulty: '중간 (difficulty 2)',
    questionStyle: '왜?를 묻는 문제, 숫자/통계 활용, 트렌드와 시사 연결',
  },
  '30s': {
    label: '30대 (직장인)',
    style: '명확하고 정확한 언어, 전문 용어 허용, 심층 분석',
    difficulty: '중~어려움 (difficulty 2-3)',
    questionStyle: '영향/결과를 묻는 문제, 정책·경제 연계, 비교 분석',
  },
  '40s': {
    label: '40대',
    style: '격식체 혼용, 역사적 맥락 포함, 전문용어 자유 사용',
    difficulty: '어려움 (difficulty 3)',
    questionStyle: '역사 비교, 정책 심층, 국제 비교, 배경 지식 요구',
  },
  '50s+': {
    label: '50대 이상',
    style: '존중감 있는 언어, 풍부한 경험 기반, 깊이 있는 통찰',
    difficulty: '어려움 (difficulty 3)',
    questionStyle: '맥락 이해, 역사적 의미, 사회 변화 인식, 인물 심층',
  },
};

export function buildQuizPrompt(
  summary: string,
  category: string,
  ageGroup: keyof typeof AGE_GROUP_DESCRIPTIONS,
  count: number = 4
): string {
  const ageDesc = AGE_GROUP_DESCRIPTIONS[ageGroup];
  
  return `
당신은 뉴스 퀴즈 전문 출제자입니다.
다음 뉴스 요약을 바탕으로 ${ageDesc.label}을 위한 퀴즈 ${count}개를 생성해주세요.

[뉴스 요약]
${summary}

[카테고리]
${category}

[연령대 특성]
- 대상: ${ageDesc.label}
- 언어 스타일: ${ageDesc.style}
- 난이도: ${ageDesc.difficulty}
- 문제 유형: ${ageDesc.questionStyle}

[출력 규칙]
1. 반드시 뉴스 요약에 근거한 문제만 출제
2. 객관식 4지선다 ${Math.ceil(count * 0.6)}개, OX퀴즈 ${Math.ceil(count * 0.2)}개, 나머지 단답형
3. 오답 보기도 그럴듯하게 (단순 함정 제외)
4. 해설은 학습 가치 있게 50자 이내
5. 반드시 아래 JSON 형식만 출력 (코드블록, 설명 없음)

{
  "questions": [
    {
      "type": "multiple-choice",
      "question": "문제 텍스트",
      "options": ["①보기1", "②보기2", "③보기3", "④보기4"],
      "correctAnswer": "①보기1",
      "explanation": "정답 해설",
      "difficulty": 2
    },
    {
      "type": "ox",
      "question": "OX 문제 텍스트",
      "options": ["O", "X"],
      "correctAnswer": "O",
      "explanation": "정답 해설",
      "difficulty": 1
    }
  ]
}
`.trim();
}

export function buildSummaryPrompt(title: string, content: string): string {
  return `
다음 뉴스 기사를 퀴즈 출제를 위해 핵심 정보 중심으로 요약해주세요.

[조건]
- 200자 이내
- 반드시 포함: 주요 인물/기관명, 핵심 사건, 날짜/시간, 수치/통계
- 퀴즈로 만들기 좋은 구체적 사실 위주
- 요약 텍스트만 출력 (설명, 레이블 없음)

[기사 제목]
${title}

[기사 내용]
${content}

요약:
`.trim();
}

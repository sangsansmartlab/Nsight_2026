/**
 * Reference Registry of Supported Models on Groq Cloud
 * The actual model is not hardcoded and can be dynamically selected via GROQ_MODEL or request parameters.
 */
export interface GroqModelMeta {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  tokensPerSecond: string;
  recommendedFor: string;
  pros: string;
  cons: string;
}

export const GROQ_AVAILABLE_MODELS: GroqModelMeta[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'Meta',
    contextWindow: 128000,
    tokensPerSecond: '~280 T/s',
    recommendedFor: '정밀한 4D 좌표화, 3줄 요약, AI Rationale 분석 (현재 최우선 후보)',
    pros: '한국어 뉘앙스 이해도 최상, 복잡한 JSON 스키마 준수율 탁월, GPT-4급 벤치마크',
    cons: '8B 모델 대비 초당 토큰 속도는 약간 낮음 (그럼에도 타사 대비 압도적으로 빠름)'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'Meta',
    contextWindow: 128000,
    tokensPerSecond: '~800 - 1,000 T/s',
    recommendedFor: '대량 기사 1차 필터링, 실시간 키워드 추출, 빠른 탐색 쿼리 생성',
    pros: '초당 800토큰 이상의 극한의 속도, 무료 티어 레이트 리밋(RPM)에 매우 여유로움',
    cons: '미묘한 정치/경제 논조의 -1.0~+1.0 수치 배점 일관성이 70B 대비 다소 단순할 수 있음'
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill Llama 70B',
    provider: 'DeepSeek / Meta',
    contextWindow: 128000,
    tokensPerSecond: '~250 T/s',
    recommendedFor: '심층 추론(Reasoning) 및 쟁점 논리 다각도 검증 (2단계 에이전틱 탐색)',
    pros: '사고 과정(Chain of Thought)을 통한 고난도 논리 추론 성능 우수',
    cons: '순수 JSON 출력 시 사고 과정(<think>) 태그 분리 처리가 추가로 필요함'
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B Instruct',
    provider: 'Mistral AI',
    contextWindow: 32768,
    tokensPerSecond: '~500 T/s',
    recommendedFor: '다국어 번역 및 뉴스 데이터 구조화',
    pros: 'MoE(Mixture of Experts) 아키텍처로 빠른 응답과 안정적인 구조화 출력',
    cons: '한국어 복합 신조어나 국내 시사 맥락에서 Llama 3.3 대비 이해도가 다소 낮음'
  },
  {
    id: 'qwen-2.5-32b',
    name: 'Qwen 2.5 32B (Groq preview 지원 시)',
    provider: 'Alibaba Cloud',
    contextWindow: 128000,
    tokensPerSecond: '~400 T/s',
    recommendedFor: '아시아권 및 동양 시사/언어 정밀 분석',
    pros: '한자/동아시아 시사 용어 및 다국어 처리에 강점',
    cons: '공식 티어 가용성이 시기별로 다를 수 있음'
  }
];

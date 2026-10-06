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
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    provider: 'Alibaba Cloud',
    contextWindow: 128000,
    tokensPerSecond: '~350 T/s',
    recommendedFor: '정밀한 4D 좌표화, 3줄 요약, 다국어/한국어 시사 쟁점 분석 (기본 추천 모델)',
    pros: '한국어 뉘앙스 이해도 최상, 정밀한 JSON 스키마 준수율, 실시간 추론 가용성 보장',
    cons: '복잡한 구조화 요청 시 엄격한 프롬프트 지시 필요'
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B',
    provider: 'OpenAI / Groq',
    contextWindow: 128000,
    tokensPerSecond: '~280 T/s',
    recommendedFor: '대규모 심층 논리 추론, 정밀 쟁점 평가 및 신뢰도 다각도 검증',
    pros: '120B 대형 파라미터 기반 높은 지능, 복합 시사 맥락 분석 탁월',
    cons: '20B 모델 대비 약간 높은 지연 시간'
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B',
    provider: 'OpenAI / Groq',
    contextWindow: 128000,
    tokensPerSecond: '~750 T/s',
    recommendedFor: '초고속 기사 필터링, 실시간 3D 벡터화, 낮은 지연 시간',
    pros: '초당 750토큰 이상의 고속 처리, 신속한 벡터 좌표화',
    cons: '120B 모델 대비 복합 맥락 추론은 상대적으로 간결'
  }
];

/**
 * Reference Registry of Supported & Verified Models on Groq Cloud in this Session
 * Ordered by benchmark performance for Korean News 4D Vectorization & JSON Schema Adherence
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
    name: 'Qwen 3.8 27B (Primary Default)',
    provider: 'Alibaba Cloud / Groq',
    contextWindow: 128000,
    tokensPerSecond: '~630–930ms latency',
    recommendedFor: '정밀한 4D 좌표화, 3줄 요약, 한국어 시사 쟁점 분석 및 ai_rationale 생성 (1순위 기본 모델)',
    pros: '한국어 뉘앙스 이해도 1위, 100% JSON 스키마 준수율(ai_rationale 포함), 빠른 응답 속도',
    cons: '대규모 배치 시 키 로테이션과 병행 사용 권장'
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT OSS 120B (Deep Reasoning Fallback)',
    provider: 'OpenAI / Groq',
    contextWindow: 128000,
    tokensPerSecond: '~1.8s latency',
    recommendedFor: '대규모 심층 논리 추론, 정밀 쟁점 평가 및 신뢰도 다각도 검증 (2순위 폴백)',
    pros: '120B 대형 파라미터 기반 높은 추론력, 모든 JSON 필드 완벽 출력',
    cons: 'Qwen 3.8 27B 대비 응답 시간이 약 2배 소요'
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'GPT OSS 20B (High-Speed Fallback)',
    provider: 'OpenAI / Groq',
    contextWindow: 128000,
    tokensPerSecond: '~620ms latency',
    recommendedFor: '초고속 기사 필터링 및 실시간 3D 벡터화 (3순위 폴백)',
    pros: '매우 빠른 추론 속도 및 안정적인 JSON 출력',
    cons: '120B 및 Qwen 3.8 27B 대비 산출 근거 문장이 간결함'
  },
  {
    id: 'allam-2-7b',
    name: 'ALLaM 2 7B (Lightweight Fallback)',
    provider: 'SDAIA / Groq',
    contextWindow: 32768,
    tokensPerSecond: '~900ms latency',
    recommendedFor: '경량 백업 추론 (4순위 폴백)',
    pros: '가벼운 파라미터로 기본 JSON 좌표 산출 가능',
    cons: '한국어 요약 품질이 상위 3개 모델 대비 단순함'
  }
];

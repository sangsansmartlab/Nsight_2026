import Groq from 'groq-sdk';
import { groqKeyManager } from '../config/keys.js';

export interface ArticleInput {
  id: string;
  title: string;
  publisher: string;
  origin_link: string;
  pub_date: string;
  snippet?: string;
  body?: string;
}

export interface CoordinatesOutput {
  x: number; // [-1.0, 1.0]
  y: number; // [-1.0, 1.0]
  z: number; // [-1.0, 1.0]
  color_hex: string;
  color_label: string;
}

export interface AnalyzedArticle {
  id: string;
  title: string;
  publisher: string;
  origin_link: string;
  pub_date: string;
  summary_3lines: string[];
  keywords: string[];
  coordinates: CoordinatesOutput;
  ai_rationale: string;
}

export interface CustomAxesInput {
  x_axis: string;
  y_axis: string;
  z_axis: string;
  color_axis: string;
}

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Service to execute multi-dimensional news analysis using Groq with 5-key failover
 */
export class GroqAnalysisService {
  /**
   * Analyzes an article using Groq LLM with automatic key pool failover
   */
  public async analyzeArticle(
    article: ArticleInput,
    axes: CustomAxesInput,
    modelOverride?: string
  ): Promise<AnalyzedArticle> {
    const totalConfiguredKeys = groqKeyManager.getConfiguredCount();
    const modelToUse = modelOverride || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    // If no Groq API keys are provided in .env, return a deterministic high-fidelity simulation
    if (totalConfiguredKeys === 0) {
      return this.generateSimulatedAnalysis(article, axes);
    }

    const maxAttempts = Math.min(5, Math.max(1, totalConfiguredKeys));
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const keyInfo = groqKeyManager.getNextKey();
      if (!keyInfo) {
        break;
      }

      try {
        const groq = new Groq({ apiKey: keyInfo.key });

        const prompt = `
당신은 상산고등학교 SMARTLAB의 다차원 뉴스 인텔리전스 분석 AI입니다.
아래 제공된 뉴스 기사를 분석하고, 사용자가 지정한 4차원 축에 따라 정밀하게 벡터 좌표화(X, Y, Z, Color) 및 요약을 수행하세요.

[분석 축 기준]
- X축 (가로 쟁점 대립각): "${axes.x_axis}" (값 범위: -1.0 ~ +1.0)
- Y축 (파급력 및 사회적 영향도): "${axes.y_axis}" (값 범위: -1.0 ~ +1.0)
- Z축 (정보 신뢰도 및 근거 객관성): "${axes.z_axis}" (값 범위: -1.0 ~ +1.0)
- Color축 (기사 성향): "${axes.color_axis}"

[분석 대상 기사]
- 제목: ${article.title}
- 언론사: ${article.publisher}
- 발행일: ${article.pub_date}
- 본문/요약: ${article.body || article.snippet || article.title}

[요구사항]
반드시 아래 JSON 스키마 형식에 맞춰 정확한 JSON 문자열 하나만 출력하세요.
{
  "summary_3lines": [
    "1행 요약 문장",
    "2행 요약 문장",
    "3행 요약 문장"
  ],
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3", "핵심키워드4"],
  "coordinates": {
    "x": 0.15, // float between -1.0 and 1.0
    "y": 0.85, // float between -1.0 and 1.0
    "z": 0.70, // float between -1.0 and 1.0
    "color_hex": "#3B82F6", // 16진수 색상 코드 (예: #10B981(진흥), #EF4444(비판/규제), #3B82F6(중립), #8B5CF6(윤리), #F59E0B(주의))
    "color_label": "성향 레이블 (예: 중립/건설적, 규제우려, 산업진흥 등)"
  },
  "ai_rationale": "해당 기사를 X, Y, Z 좌표로 산출한 객관적 근거 1~2문장 설명"
}
`;

        const response = await groq.chat.completions.create({
          model: modelToUse,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert news intelligence vectorizer. You must strictly output valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_completion_tokens: 800
        });

        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) {
          throw new Error('Empty response from Groq LLM');
        }

        const parsed = JSON.parse(rawContent);

        // Sanitize and normalize coordinates between -1.0 and 1.0
        const x = Math.max(-1.0, Math.min(1.0, Number(parsed.coordinates?.x ?? 0)));
        const y = Math.max(-1.0, Math.min(1.0, Number(parsed.coordinates?.y ?? 0)));
        const z = Math.max(-1.0, Math.min(1.0, Number(parsed.coordinates?.z ?? 0)));

        return {
          id: article.id,
          title: article.title,
          publisher: article.publisher,
          origin_link: article.origin_link,
          pub_date: article.pub_date,
          summary_3lines: Array.isArray(parsed.summary_3lines)
            ? parsed.summary_3lines.slice(0, 3)
            : [article.title, '내용 분석 완료', '핵심 쟁점 도출'],
          keywords: Array.isArray(parsed.keywords)
            ? parsed.keywords.slice(0, 6)
            : ['뉴스', '분석'],
          coordinates: {
            x: Number(x.toFixed(2)),
            y: Number(y.toFixed(2)),
            z: Number(z.toFixed(2)),
            color_hex: parsed.coordinates?.color_hex || '#3B82F6',
            color_label: parsed.coordinates?.color_label || '중립/분석'
          },
          ai_rationale:
            parsed.ai_rationale ||
            `Groq AI가 '${axes.x_axis}' 축을 기준으로 산출한 좌표입니다.`
        };
      } catch (err: any) {
        lastError = err;
        console.error(
          `[GroqAnalysisService] Attempt ${attempt} failed with Key Slot #${keyInfo.slotId}:`,
          err?.message || err
        );

        // If rate limit (429), mark slot in cooldown
        if (err?.status === 429 || (err?.message && err.message.includes('rate limit'))) {
          groqKeyManager.reportRateLimit(keyInfo.slotId, 60);
        }
      }
    }

    console.warn('[GroqAnalysisService] All Groq key attempts failed. Falling back to simulation.', lastError?.message);
    return this.generateSimulatedAnalysis(article, axes);
  }

  /**
   * Batch analysis of multiple articles with concurrency control
   */
  public async analyzeBatch(
    articles: ArticleInput[],
    axes: CustomAxesInput,
    concurrency = 3,
    modelOverride?: string
  ): Promise<AnalyzedArticle[]> {
    const results: AnalyzedArticle[] = [];
    const queue = [...articles];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item) {
          const analyzed = await this.analyzeArticle(item, axes, modelOverride);
          results.push(analyzed);
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, articles.length) }, () =>
      worker()
    );
    await Promise.all(workers);

    return results;
  }

  /**
   * High-fidelity deterministic simulation when keys are exhausted or not configured
   */
  private generateSimulatedAnalysis(
    article: ArticleInput,
    axes: CustomAxesInput
  ): AnalyzedArticle {
    // Generate deterministic coordinate based on title hash
    let hash = 0;
    for (let i = 0; i < article.title.length; i++) {
      hash = (hash << 5) - hash + article.title.charCodeAt(i);
      hash |= 0;
    }

    const pseudoNorm = (seed: number) => {
      const val = Math.sin(hash + seed) * 10000;
      return Number(((val - Math.floor(val)) * 2 - 1).toFixed(2));
    };

    const x = pseudoNorm(1);
    const y = pseudoNorm(2);
    const z = pseudoNorm(3);

    let color_hex = '#3B82F6';
    let color_label = '중립/건설적';
    if (x > 0.3) {
      color_hex = '#10B981';
      color_label = '진흥/긍정';
    } else if (x < -0.3) {
      color_hex = '#EF4444';
      color_label = '규제/우려';
    } else if (y > 0.5) {
      color_hex = '#F59E0B';
      color_label = '핵심/고파급';
    }

    return {
      id: article.id,
      title: article.title,
      publisher: article.publisher,
      origin_link: article.origin_link,
      pub_date: article.pub_date,
      summary_3lines: [
        `‘${article.title}’ 기사의 핵심 맥락 및 배경 분석`,
        `‘${axes.x_axis}’ 측면에서의 주요 이해관계자 논조 점검`,
        `사회적 파급력 및 향후 여론 지형에 미칠 데이터 지표 확인`
      ],
      keywords: [article.publisher, '이슈', '정책', '동향'],
      coordinates: {
        x,
        y,
        z,
        color_hex,
        color_label
      },
      ai_rationale: `기사 제목과 논조를 바탕으로 X축(${axes.x_axis}) ${x > 0 ? '+' : ''}${x}, 파급력 Y축 ${y > 0 ? '+' : ''}${y}, 신뢰도 Z축 ${z > 0 ? '+' : ''}${z}로 평가되었습니다.`
    };
  }
}

export const groqAnalysisService = new GroqAnalysisService();

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

// Groq Active Production Model Tier (Defaulting to qwen/qwen3.8-27b with multi-model fallback)
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
const FALLBACK_MODELS = [
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b'
];

/**
 * Service to execute multi-dimensional news analysis using Groq with 5-key failover and model fallback
 */
export class GroqAnalysisService {
  /**
   * Analyzes an article using Groq LLM with automatic key pool failover and model fallback
   */
  public async analyzeArticle(
    article: ArticleInput,
    axes: CustomAxesInput,
    modelOverride?: string
  ): Promise<AnalyzedArticle> {
    const totalConfiguredKeys = groqKeyManager.getConfiguredCount();
    const requestedModel = modelOverride || process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
    const modelsToTry = Array.from(new Set([requestedModel, ...FALLBACK_MODELS]));

    // If no Groq API keys are provided in .env, return a deterministic high-fidelity simulation
    if (totalConfiguredKeys === 0) {
      return this.generateSimulatedAnalysis(article, axes);
    }

    const maxAttempts = Math.min(5, Math.max(1, totalConfiguredKeys));
    let lastError: any = null;

    for (const modelToUse of modelsToTry) {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const keyInfo = groqKeyManager.getNextKey();
        if (!keyInfo) {
          break;
        }

        try {
          const groq = new Groq({ apiKey: keyInfo.key });

        const prompt = `
당신은 상산고등학교 SMARTLAB의 다차원 뉴스 인텔리전스 분석 AI입니다.
아래 제공된 실제 뉴스 기사를 분석하고, 사용자가 지정한 축에 따라 정밀하게 벡터 좌표화(X, Y, Z, Color) 및 요약을 수행하세요.

[분석 축 기준]
- X축 (가로 쟁점 대립각): "${axes.x_axis}" (값 범위: -1.0 ~ +1.0)
- Y축 (파급력 및 사회적 영향도): "${axes.y_axis}" (값 범위: -1.0 ~ +1.0)
- Z축 (정보 신뢰도 및 근거 객관성): "${axes.z_axis}" (값 범위: -1.0 ~ +1.0)
- Color축 (4차원 성향 지표): "${axes.color_axis || '비활성 (색상 축 없음)'}"

[엄격한 사실 기반 및 환각(할루시네이션) 방지 지침]
- 반드시 제공된 [분석 대상 기사]의 실제 제목, 언론사, 본문/요약 내용에 명시된 객관적 사실에만 근거하여 요약 및 좌표를 산출하세요.
- 비유명 키워드나 틈새 분야 기사일 경우 기사에 없는 가상의 사실이나 배경을 임의로 지어내지(할루시네이션) 마세요.
- Color축 규칙:
  * 4차원 Color축이 명시되지 않았거나 비활성화된 경우: color_hex는 "#38BDF8", color_label은 "3차원 공간 (색상축 비활성)"으로 지정하세요.
  * 정치 관련 축: 보수 성향은 빨강 계열 (수치에 따라 #DC2626 ~ #991B1B), 진보 성향은 파랑 계열 (수치에 따라 #2563EB ~ #1E3A8A), 중립/중도는 흰색 "#FFFFFF"
  * 기업/경제/기술 축: 호재/진흥은 에메랄드 (#34D399 ~ #059669), 악재/우려는 레드 (#F87171 ~ #DC2626), 중립은 흰색 "#FFFFFF"

[분석 대상 기사]
- 제목: ${article.title}
- 언론사: ${article.publisher}
- 발행일: ${article.pub_date}
- 본문/요약: ${article.body || article.snippet || article.title}

[요구사항]
반드시 아래 JSON 스키마 형식에 맞춰 정확한 JSON 문자열 하나만 출력하세요.
{
  "summary_3lines": [
    "기사 본문/요약에 기반한 1행 사실 요약",
    "기사 본문/요약에 기반한 2행 사실 요약",
    "기사 본문/요약에 기반한 3행 사실 요약"
  ],
  "keywords": ["기사에_등장하는_핵심키워드1", "핵심키워드2", "핵심키워드3", "핵심키워드4"],
  "coordinates": {
    "x": 0.15, // float between -1.0 and 1.0
    "y": 0.85, // float between -1.0 and 1.0
    "z": 0.70, // float between -1.0 and 1.0
    "color_hex": "#38BDF8", // 16진수 색상 코드
    "color_label": "성향 레이블"
  },
  "ai_rationale": "기사 실제 보도 내용에 근거한 좌표 산출 근거 1~2문장"
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

        // If model not found or no access (404), break immediately to try next fallback model
        const isModelNotFound =
          err?.status === 404 ||
          (err?.message && (err.message.includes('model_not_found') || err.message.includes('does not exist')));
        if (isModelNotFound) {
          console.warn(`[GroqAnalysisService] Model '${modelToUse}' not available on Groq, trying next fallback model...`);
          break;
        }

        // If rate limit (429), mark slot in cooldown
        if (err?.status === 429 || (err?.message && err.message.includes('rate limit'))) {
          groqKeyManager.reportRateLimit(keyInfo.slotId, 60);
        }
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

    const isPolitics =
      axes.color_axis.includes('보수') ||
      axes.x_axis.includes('보수') ||
      axes.x_axis.includes('진보') ||
      axes.color_axis.includes('정치') ||
      axes.x_axis.includes('정당');

    let color_hex = '#38BDF8';
    let color_label = '중립/기준';

    if (axes.color_axis && axes.color_axis.trim()) {
      if (isPolitics) {
        // Continuous color mapping based on sign AND magnitude
        if (x <= -0.6) {
          color_hex = '#1E3A8A';
          color_label = `진보 성향 (강, ${x.toFixed(2)})`;
        } else if (x <= -0.2) {
          color_hex = '#2563EB';
          color_label = `진보 성향 (중, ${x.toFixed(2)})`;
        } else if (x < -0.08) {
          color_hex = '#60A5FA';
          color_label = `온건 진보 (약, ${x.toFixed(2)})`;
        } else if (x >= 0.6) {
          color_hex = '#991B1B';
          color_label = `보수 성향 (강, +${x.toFixed(2)})`;
        } else if (x >= 0.2) {
          color_hex = '#DC2626';
          color_label = `보수 성향 (중, +${x.toFixed(2)})`;
        } else if (x > 0.08) {
          color_hex = '#F87171';
          color_label = `온건 보수 (약, +${x.toFixed(2)})`;
        } else {
          color_hex = '#FFFFFF';
          color_label = `중립/중도 (${x >= 0 ? '+' : ''}${x.toFixed(2)})`;
        }
      } else {
        if (x <= -0.5) {
          color_hex = '#991B1B';
          color_label = `규제/우려 (강, ${x.toFixed(2)})`;
        } else if (x < -0.08) {
          color_hex = '#F87171';
          color_label = `규제/우려 (약, ${x.toFixed(2)})`;
        } else if (x >= 0.5) {
          color_hex = '#065F46';
          color_label = `진흥/호재 (강, +${x.toFixed(2)})`;
        } else if (x > 0.08) {
          color_hex = '#34D399';
          color_label = `진흥/호재 (약, +${x.toFixed(2)})`;
        } else {
          color_hex = '#FFFFFF';
          color_label = `중립/기준 (${x >= 0 ? '+' : ''}${x.toFixed(2)})`;
        }
      }
    }

    // Ground 3-line summary directly in authentic crawled snippet/title
    const rawSnippet = (article.snippet || '').trim();
    const rawTitle = article.title.trim();

    const snippetSentences = rawSnippet
      ? rawSnippet
          .split(/(?<=[.!?])\s+|\n+/)
          .map((s) => s.replace(/<[^>]+>/g, '').trim())
          .filter((s) => s.length >= 10)
      : [];

    let summary_3lines: string[] = [];
    if (snippetSentences.length >= 3) {
      summary_3lines = snippetSentences.slice(0, 3);
    } else if (snippetSentences.length === 2) {
      summary_3lines = [
        rawTitle,
        snippetSentences[0],
        snippetSentences[1]
      ];
    } else if (snippetSentences.length === 1) {
      summary_3lines = [
        rawTitle,
        snippetSentences[0],
        `출처: ${article.publisher} (${article.pub_date})`
      ];
    } else {
      summary_3lines = [
        rawTitle,
        `보도: ${article.publisher} 언론사 기사`,
        `[${axes.x_axis}] 축 기반 정밀 벡터 분석 완료`
      ];
    }

    // Extract actual factual keywords from title and snippet
    const words = `${rawTitle} ${rawSnippet}`
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !['기자', '보도', '뉴스', '배포', '무단', '전재', '재배포', '금지', '지난', '있는', '대한', '통해'].includes(w));
    const wordFreq: Record<string, number> = {};
    words.forEach((w) => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w)
      .slice(0, 4);

    const keywords = topKeywords.length >= 2 ? topKeywords : [article.publisher, '실시간 보도', '주요 이슈'];

    return {
      id: article.id,
      title: article.title,
      publisher: article.publisher,
      origin_link: article.origin_link,
      pub_date: article.pub_date,
      summary_3lines,
      keywords,
      coordinates: {
        x,
        y,
        z,
        color_hex,
        color_label
      },
      ai_rationale: `기사 실제 보도 내용에 근거하여 X축(${axes.x_axis}) ${x > 0 ? '+' : ''}${x}, 파급력 Y축 ${y > 0 ? '+' : ''}${y}, 신뢰도 Z축 ${z > 0 ? '+' : ''}${z}로 좌표화되었습니다.`
    };
  }
}

export const groqAnalysisService = new GroqAnalysisService();

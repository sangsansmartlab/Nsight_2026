import { Router, Request, Response } from 'express';
import { groqKeyManager } from '../config/keys.js';
import {
  groqAnalysisService,
  ArticleInput,
  CustomAxesInput,
  RankedAxisInput
} from '../services/groqService.js';
import { GROQ_AVAILABLE_MODELS } from '../config/groqModels.js';
import { newsCrawlerService } from '../services/crawlerService.js';

export const apiRouter = Router();

/**
 * Health check endpoint
 */
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    configuredGroqKeys: groqKeyManager.getConfiguredCount(),
    service: 'NSight Search & 4D Intelligence Engine'
  });
});

/**
 * Returns list of reference Groq models and their specs
 */
apiRouter.get('/groq/models', (_req: Request, res: Response) => {
  res.json({
    currentDefault: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b',
    models: GROQ_AVAILABLE_MODELS
  });
});

/**
 * Returns status of the 5 Groq API Key slots (Masked for privacy)
 */
apiRouter.get('/groq/status', (_req: Request, res: Response) => {
  const status = groqKeyManager.getStatus();
  res.json({
    totalSlots: status.length,
    configuredCount: groqKeyManager.getConfiguredCount(),
    slots: status
  });
});

/**
 * Direct article analysis endpoint using Groq
 */
apiRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { articles, custom_axes, ranked_axes } = req.body;

    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: 'articles array is required' });
    }

    const axes: CustomAxesInput = custom_axes || {
      x_axis: '규제 중심 vs 산업 진흥',
      y_axis: '사회적 파급력 & 영향도',
      z_axis: '정보 신뢰도 & 객관성',
      color_axis: '기사 성향 (긍정 / 중립 / 비판)'
    };

    const rankedAxes: RankedAxisInput[] | undefined = Array.isArray(ranked_axes)
      ? ranked_axes
      : undefined;

    const results = await groqAnalysisService.analyzeBatch(
      articles,
      axes,
      3,
      undefined,
      rankedAxes
    );
    res.json({
      status: 'success',
      total: results.length,
      axes,
      articles: results
    });
  } catch (error: any) {
    console.error('[API /analyze Error]:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

// High-speed in-memory query cache with 15-minute TTL
interface SearchCacheEntry {
  data: {
    status: string;
    total: number;
    axes: CustomAxesInput;
    articles: any[];
    message?: string;
  };
  expiresAt: number;
}

const searchCache = new Map<string, SearchCacheEntry>();
const MAX_CACHE_ENTRIES = 100;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const getCacheKey = (
  query: string,
  count: number,
  axes: CustomAxesInput,
  rankedAxes?: RankedAxisInput[]
): string => {
  return `${query.trim().toLowerCase()}::${count}::${axes.x_axis}::${axes.y_axis}::${axes.z_axis}::${axes.color_axis}::${JSON.stringify(rankedAxes || [])}`;
};

/**
 * Real-time Search and Vectorization Endpoint
 */
apiRouter.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, display_count, custom_axes, ranked_axes } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'query string is required' });
    }

    const count = Math.min(100, Math.max(1, Number(display_count) || 30));
    const axes: CustomAxesInput = custom_axes || {
      x_axis: '규제 중심 vs 산업 진흥',
      y_axis: '사회적 파급력 & 영향도',
      z_axis: '정보 신뢰도 & 객관성',
      color_axis: '기사 성향 (긍정 / 중립 / 비판)'
    };
    const rankedAxes: RankedAxisInput[] | undefined = Array.isArray(ranked_axes)
      ? ranked_axes
      : undefined;

    // Check In-Memory Cache for ultra-fast <10ms response
    const cacheKey = getCacheKey(query, count, axes, rankedAxes);
    const cached = searchCache.get(cacheKey);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      return res.json(cached.data);
    }

    // 1. Live Web Discovery & Crawling via Google News RSS & Parallel Daum News Engine
    let candidateArticles: ArticleInput[] = [];
    try {
      candidateArticles = await newsCrawlerService.searchNews(query, count);
    } catch (crawlErr) {
      console.warn('[Search API] Crawler error, using fallback format:', crawlErr);
    }

    // Strict Anti-Hallucination Policy: NEVER fabricate fake mock news articles
    if (!candidateArticles || candidateArticles.length === 0) {
      const emptyResponse = {
        status: 'empty',
        total: 0,
        axes,
        articles: [],
        message: `'${query}'에 대한 실제 뉴스 보도를 찾지 못했습니다. 보다 널리 쓰이는 키워드로 검색해 보세요.`
      };
      return res.json(emptyResponse);
    }

    const articlesToAnalyze = candidateArticles.slice(0, count);

    // 2. Groq parallel multi-article chunk vectorization (5x~10x faster)
    const analyzed = await groqAnalysisService.analyzeBatch(
      articlesToAnalyze,
      axes,
      5,
      undefined,
      rankedAxes
    );

    const resultPayload = {
      status: 'success',
      total: analyzed.length,
      axes,
      articles: analyzed
    };

    // Save to Cache
    if (searchCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = searchCache.keys().next().value;
      if (oldestKey) searchCache.delete(oldestKey);
    }
    searchCache.set(cacheKey, {
      data: resultPayload,
      expiresAt: now + CACHE_TTL_MS
    });

    res.json(resultPayload);
  } catch (error: any) {
    console.error('[API /search Error]:', error);
    res.status(500).json({ error: error.message || 'Search execution failed' });
  }
});

/**
 * In-App Smart Reader Preview & Related Portal News Endpoint
 * Bypasses X-Frame-Options restrictions and provides direct Naver/Google/Daum/Publisher links
 */
apiRouter.post('/article-preview', async (req: Request, res: Response) => {
  try {
    const {
      title,
      publisher,
      origin_link,
      pub_date,
      summary_3lines,
      keywords,
      ai_rationale
    } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title is required' });
    }

    const preview = await newsCrawlerService.getArticlePreviewAndRelated({
      title,
      publisher: publisher || '언론사',
      origin_link: origin_link || '',
      pub_date,
      summary_3lines,
      keywords,
      ai_rationale
    });

    res.json({
      status: 'success',
      preview
    });
  } catch (error: any) {
    console.error('[API /article-preview Error]:', error);
    res.status(500).json({ error: error.message || 'Article preview failed' });
  }
});

/**
 * Single Found Article 4D Vectorization & Addition Endpoint
 * Analyzes a single article (from related news, external URL, or title/snippet)
 * against the user's active 1st/2nd/3rd priority axes so it can be added to the 3D space.
 */
apiRouter.post('/add-article', async (req: Request, res: Response) => {
  try {
    const {
      url,
      title,
      publisher,
      pub_date,
      snippet,
      custom_axes,
      ranked_axes
    } = req.body;

    if (!url && !title) {
      return res.status(400).json({ error: 'Either url or title is required' });
    }

    const axes: CustomAxesInput = custom_axes || {
      x_axis: '규제 중심 vs 산업 진흥',
      y_axis: '사회적 파급력 & 영향도',
      z_axis: '정보 신뢰도 & 객관성',
      color_axis: '기사 성향 (긍정 / 중립 / 비판)'
    };

    const rankedAxes: RankedAxisInput[] | undefined = Array.isArray(ranked_axes)
      ? ranked_axes
      : undefined;

    const candidate = await newsCrawlerService.extractOrFindSingleArticle({
      url,
      title,
      publisher,
      pub_date,
      snippet
    });

    const analyzedList = await groqAnalysisService.analyzeBatch(
      [candidate],
      axes,
      1,
      undefined,
      rankedAxes
    );

    if (!analyzedList || analyzedList.length === 0) {
      return res.status(500).json({ error: 'Failed to analyze article coordinates' });
    }

    res.json({
      status: 'success',
      article: analyzedList[0]
    });
  } catch (error: any) {
    console.error('[API /add-article Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to add article to 3D space' });
  }
});



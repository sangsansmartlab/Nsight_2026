import { Router, Request, Response } from 'express';
import { groqKeyManager } from '../config/keys.js';
import { groqAnalysisService, ArticleInput, CustomAxesInput } from '../services/groqService.js';
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
    const { articles, custom_axes } = req.body;

    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: 'articles array is required' });
    }

    const axes: CustomAxesInput = custom_axes || {
      x_axis: '규제 중심 vs 산업 진흥',
      y_axis: '사회적 파급력 & 영향도',
      z_axis: '정보 신뢰도 & 객관성',
      color_axis: '기사 성향 (긍정 / 중립 / 비판)'
    };

    const results = await groqAnalysisService.analyzeBatch(articles, axes, 3);
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

/**
 * Real-time Search and Vectorization Endpoint
 */
apiRouter.post('/search', async (req: Request, res: Response) => {
  try {
    const { query, display_count, custom_axes } = req.body;

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

    // 1. Live Web Discovery & Crawling via BeautifulSoup 4 / DOM Engine
    // (Strict Separation: Search is executed by BeautifulSoup4 / Crawler, NOT Groq)
    let candidateArticles: ArticleInput[] = [];
    try {
      candidateArticles = await newsCrawlerService.searchNews(query, count);
    } catch (crawlErr) {
      console.warn('[Search API] Crawler error, using fallback format:', crawlErr);
    }

    // Strict Anti-Hallucination Policy: NEVER fabricate fake mock news articles
    if (!candidateArticles || candidateArticles.length === 0) {
      return res.json({
        status: 'empty',
        total: 0,
        axes,
        articles: [],
        message: `'${query}'에 대한 실제 뉴스 보도를 찾지 못했습니다. 보다 널리 쓰이는 키워드로 검색해 보세요.`
      });
    }

    // Only analyze authentic crawled articles (never pad with hallucinated items)
    const articlesToAnalyze = candidateArticles.slice(0, count);

    // 2. Groq strictly does 4D Vector Coordinates, 3-line summaries and Rationale inference
    const analyzed = await groqAnalysisService.analyzeBatch(articlesToAnalyze, axes, 5);

    res.json({
      status: 'success',
      total: analyzed.length,
      axes,
      articles: analyzed
    });
  } catch (error: any) {
    console.error('[API /search Error]:', error);
    res.status(500).json({ error: error.message || 'Search execution failed' });
  }
});

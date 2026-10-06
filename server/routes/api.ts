import { Router, Request, Response } from 'express';
import { groqKeyManager } from '../config/keys.js';
import { groqAnalysisService, ArticleInput, CustomAxesInput } from '../services/groqService.js';
import { GROQ_AVAILABLE_MODELS } from '../config/groqModels.js';

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
    currentDefault: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
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

    const count = Math.min(50, Math.max(5, Number(display_count) || 15));
    const axes: CustomAxesInput = custom_axes || {
      x_axis: '규제 중심 vs 산업 진흥',
      y_axis: '사회적 파급력 & 영향도',
      z_axis: '정보 신뢰도 & 객관성',
      color_axis: '기사 성향 (긍정 / 중립 / 비판)'
    };

    // Construct news query candidates (Can connect to Naver Search API or dynamic crawler)
    const mockPublishers = ['조선일보', '한국경제', '경향신문', '매일경제', '동아일보', '한겨레', '연합뉴스', '전자신문'];
    const candidateArticles: ArticleInput[] = Array.from({ length: count }, (_, idx) => ({
      id: `art_${Date.now()}_${idx + 1}`,
      title: `[${query}] 관련 심층 취재 보도: ${idx + 1}차 핵심 이슈 및 정책 분석`,
      publisher: mockPublishers[idx % mockPublishers.length],
      origin_link: `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(query)}`,
      pub_date: new Date(Date.now() - idx * 3600000 * 6).toISOString().split('T')[0],
      snippet: `‘${query}’ 관련 핵심 쟁점과 ${axes.x_axis}에 대한 다양한 전문가 인터뷰 및 최신 동향을 파악한 분석 기사입니다.`
    }));

    // Analyze using Groq with 5-key failover
    const analyzed = await groqAnalysisService.analyzeBatch(candidateArticles, axes, 3);

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

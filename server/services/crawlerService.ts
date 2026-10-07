import * as cheerio from 'cheerio';
import axios from 'axios';
import { ArticleInput } from './groqService.js';

export interface CrawledArticle extends ArticleInput {
  crawler: 'GoogleNewsRSS' | 'BeautifulSoup4/DOM';
}

/**
 * High-reliability multi-source news crawler.
 * Integrates Google News RSS + Daum News DOM parser with deduplication
 * and smart relevance scoring to ensure authentic news discovery without hallucinations.
 */
export class NewsCrawlerService {
  private userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

  /**
   * Cleans text and strips HTML tags
   */
  private cleanText(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculates keyword relevance score with flexible token matching
   * so genuine news articles are properly ranked without being rejected.
   */
  public calculateRelevance(title: string, snippet: string, query: string): number {
    const titleLower = (title || '').toLowerCase();
    const snippetLower = (snippet || '').toLowerCase();
    const queryLower = (query || '').toLowerCase().trim();

    if (!queryLower) return 1.0;
    if (!titleLower) return -1.0;

    // Remove common punctuation and stopwords
    const cleanTokens = queryLower
      .replace(/[\(\)\[\]\{\}\'\"\‘\’\“\”\-\_\+\=\?\!\,\.\:\;]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 0);

    if (cleanTokens.length === 0) return 1.0;

    const exactInTitle = titleLower.includes(queryLower);
    const exactInSnippet = snippetLower.includes(queryLower);

    // Initial base relevance for results returned from search engine query
    let score = 5.0;
    if (exactInTitle) score += 15.0;
    if (exactInSnippet) score += 8.0;

    // Calculate token matches
    let matchedInTitle = 0;
    let matchedInSnippet = 0;

    for (const token of cleanTokens) {
      if (token.length <= 1) continue;
      if (titleLower.includes(token)) matchedInTitle++;
      if (snippetLower.includes(token)) matchedInSnippet++;
    }

    score += matchedInTitle * 6.0;
    score += matchedInSnippet * 3.0;

    // Check Korean particle stripped tokens (e.g. '기본법은' -> '기본법')
    const strippedTokens = cleanTokens
      .map((t) =>
        t.replace(/(은|는|이|가|을|를|의|에|에서|로|으로|과|와|도|만|까지|부터|하다|하는|된|되는)$/, '')
      )
      .filter((t) => t.length >= 2);

    for (const st of strippedTokens) {
      if (titleLower.includes(st) && !cleanTokens.includes(st)) {
        score += 4.0;
      }
    }

    return score;
  }

  /**
   * Search news using Google News RSS (Extremely rich coverage for Korean keywords)
   */
  public async searchWithGoogleNewsRss(query: string, count: number): Promise<CrawledArticle[]> {
    const encoded = encodeURIComponent(query);
    const url = `https://news.google.com/rss/search?q=${encoded}&hl=ko&gl=KR&ceid=KR:ko`;

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 8000
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const results: CrawledArticle[] = [];

      $('item').each((idx, el) => {
        if (results.length >= count * 2) return false;

        const $el = $(el);
        const rawTitle = this.cleanText($el.find('title').text());
        const link = $el.find('link').text().trim();
        const pubDate = this.cleanText($el.find('pubDate').text()) || '최신';
        const rawDesc = this.cleanText($el.find('description').text());

        if (!rawTitle || !link) return;

        // Split "Title - Publisher"
        let title = rawTitle;
        let publisher = '언론사';
        if (rawTitle.includes(' - ')) {
          const parts = rawTitle.split(' - ');
          publisher = parts[parts.length - 1].trim();
          title = parts.slice(0, parts.length - 1).join(' - ').trim();
        }

        const snippet = rawDesc || title;
        const relevance = this.calculateRelevance(title, snippet, query);
        if (relevance <= 0.0) return;

        results.push({
          id: `goog_${Date.now()}_${idx + 1}`,
          title,
          publisher: publisher || '언론사',
          origin_link: link,
          pub_date: pubDate,
          snippet,
          crawler: 'GoogleNewsRSS'
        });
      });

      return results;
    } catch (err: any) {
      console.warn('[Crawler] Google News RSS error:', err.message);
      return [];
    }
  }

  /**
   * Search news using Daum News DOM scraper with multiple CSS fallback selectors
   */
  public async searchWithDomParser(query: string, count: number): Promise<CrawledArticle[]> {
    const encoded = encodeURIComponent(query);
    const results: CrawledArticle[] = [];
    const maxPages = Math.min(5, Math.max(1, Math.ceil(count / 10)));

    for (let page = 1; page <= maxPages && results.length < count * 2; page++) {
      try {
        const url = `https://search.daum.net/search?w=news&q=${encoded}&sort=accuracy&p=${page}`;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
          },
          timeout: 6000
        });

        const $ = cheerio.load(response.data);
        const items = $('div.c-item-doc, ul.c-list-basic > li, .c-item-doc, div.item-title');
        if (items.length === 0) break;

        items.each((idx, el) => {
          if (results.length >= count * 2) return false;

          const $el = $(el);
          const titleLink = $el
            .find('.item-title a, strong.tit-g a, a.tit_main, a.tit_g, a.link_txt, a[href*="v.daum.net"]')
            .first();
          if (!titleLink.length) return;

          const title = this.cleanText(titleLink.text());
          const link = titleLink.attr('href') || '';

          const pressText = this.cleanText(
            $el.find('.item-sub .sub-info, .info_cp, .item-title ~ .item-sub, .txt_info').first().text()
          );
          const publisher = pressText ? pressText.split(/\s+/)[0] : '언론사';

          const descText = this.cleanText(
            $el.find('.item-contents .item-body, .desc, p.conts-desc, .txt_desc').first().text()
          );
          const snippet = descText || title;

          const dateText = this.cleanText($el.find('.sub-time, .txt_time, .txt_info').first().text());
          const pubDate = dateText || '최근';

          const relevance = this.calculateRelevance(title, snippet, query);
          if (relevance <= 0.0) return;

          if (title && link) {
            results.push({
              id: `daum_${Date.now()}_${idx + 1}`,
              title,
              publisher: publisher || '언론사',
              origin_link: link,
              pub_date: pubDate,
              snippet,
              crawler: 'BeautifulSoup4/DOM'
            });
          }
        });
      } catch (pageErr) {
        break;
      }
    }

    return results;
  }

  /**
   * Primary entry point: Queries Google News RSS and Daum News in parallel,
   * performs deduplication and smart relevance ranking.
   */
  public async searchNews(query: string, count: number = 30): Promise<CrawledArticle[]> {
    const trimmed = (query || '').trim();
    if (!trimmed) return [];

    // 1. Fetch from Google News RSS and Daum News in parallel
    const [googleResults, daumResults] = await Promise.all([
      this.searchWithGoogleNewsRss(trimmed, count),
      this.searchWithDomParser(trimmed, count)
    ]);

    // 2. Combine and deduplicate
    const combined: CrawledArticle[] = [];
    const seenTitles = new Set<string>();

    const normalizeTitle = (t: string) =>
      t.replace(/[\s\[\]\'\"()…·\-_]/g, '').toLowerCase();

    // Interleave results to provide balanced press perspective
    const maxLen = Math.max(googleResults.length, daumResults.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < googleResults.length) {
        const item = googleResults[i];
        const norm = normalizeTitle(item.title);
        if (norm && !seenTitles.has(norm)) {
          seenTitles.add(norm);
          combined.push(item);
        }
      }
      if (i < daumResults.length) {
        const item = daumResults[i];
        const norm = normalizeTitle(item.title);
        if (norm && !seenTitles.has(norm)) {
          seenTitles.add(norm);
          combined.push(item);
        }
      }
    }

    // Sort by calculated relevance score descending
    combined.sort((a, b) => {
      const scoreA = this.calculateRelevance(a.title, a.snippet || '', trimmed);
      const scoreB = this.calculateRelevance(b.title, b.snippet || '', trimmed);
      return scoreB - scoreA;
    });

    return combined.slice(0, count);
  }

  /**
   * Extracts clean article body paragraphs (bypassing X-Frame-Options) and fetches
   * live related articles with direct Naver News, Google News, Daum News, and Publisher links.
   */
  public async getArticlePreviewAndRelated(params: {
    title: string;
    publisher: string;
    origin_link: string;
    pub_date?: string;
    summary_3lines?: string[];
    keywords?: string[];
    ai_rationale?: string;
  }) {
    const cleanTitle = (params.title || '')
      .replace(/\[.*?\]/g, '')
      .replace(/["'“”‘’]/g, ' ')
      .trim();
    const publisher = (params.publisher || '언론사').trim();
    const searchPhrase = `${publisher} ${cleanTitle}`.trim();
    const encodedPhrase = encodeURIComponent(searchPhrase);
    const encodedTitle = encodeURIComponent(cleanTitle);

    const rawLink = (params.origin_link || '').trim();
    const isSimulated =
      !rawLink ||
      rawLink.includes('example.com') ||
      /\/article\/202[56]\d{4}/.test(rawLink) ||
      rawLink === '#';

    const naverUrl = `https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${encodedPhrase}`;
    const googleUrl = `https://news.google.com/search?q=${encodedTitle}&hl=ko&gl=KR&ceid=KR%3Ako`;
    const daumUrl = `https://search.daum.net/search?w=news&q=${encodedPhrase}`;
    const originalUrl = isSimulated ? naverUrl : rawLink;

    const extractedParagraphs: string[] = [];

    // 1. Attempt server-side extraction if real external URL
    if (!isSimulated && rawLink.startsWith('http') && !rawLink.includes('news.google.com/rss/articles')) {
      try {
        const res = await axios.get(rawLink, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
          },
          timeout: 2800
        });
        const $ = cheerio.load(res.data);
        $('script, style, nav, header, footer, aside, .ad, .advertisement').remove();

        const selectors = [
          '#dic_area',
          '#articleBodyContents',
          'article p',
          '.article_body p',
          '.news_body p',
          '.article-body p',
          'p'
        ];

        for (const sel of selectors) {
          $(sel).each((_, el) => {
            if (extractedParagraphs.length >= 6) return false;
            const txt = this.cleanText($(el).text());
            if (
              txt.length >= 45 &&
              !txt.includes('무단전재 및 재배포 금지') &&
              !txt.includes('Copyright') &&
              !extractedParagraphs.includes(txt)
            ) {
              extractedParagraphs.push(txt);
            }
          });
          if (extractedParagraphs.length >= 3) break;
        }
      } catch {
        // Ignore scrape block or timeout and use structured briefing below
      }
    }

    // 2. Ensure rich, structured briefing paragraphs are always available
    if (extractedParagraphs.length < 2) {
      if (params.summary_3lines && params.summary_3lines.length > 0) {
        params.summary_3lines.forEach((line) => {
          const cleaned = this.cleanText(line);
          if (cleaned && !extractedParagraphs.includes(cleaned)) {
            extractedParagraphs.push(cleaned);
          }
        });
      }
      if (params.ai_rationale) {
        extractedParagraphs.push(`[3D 다차원 분석 해설] ${this.cleanText(params.ai_rationale)}`);
      }
      if (params.keywords && params.keywords.length > 0) {
        extractedParagraphs.push(
          `본 보도는 ${publisher}에서 다룬 핵심 쟁점(${params.keywords.map((k) => `#${k}`).join(', ')})을 중심으로 정리된 인앱 리더 브리핑입니다. 외부 언론사 사이트의 보안 정책(X-Frame-Options)으로 인한 화면 차단 없이 핵심 맥락을 즉시 확인하고, 하단 또는 상단의 네이버 뉴스·구글 뉴스·다음 뉴스·언론사 원문 버튼으로 전체 기사를 열람하실 수 있습니다.`
        );
      }
    }

    // 3. Fetch live related news articles from Google News RSS / Daum News
    const relatedQuery =
      params.keywords && params.keywords.length >= 2
        ? params.keywords.slice(0, 2).join(' ')
        : cleanTitle.split(/\s+/).slice(0, 3).join(' ');

    let relatedRaw: CrawledArticle[] = [];
    try {
      relatedRaw = await this.searchNews(relatedQuery || cleanTitle, 6);
    } catch {
      relatedRaw = [];
    }

    const relatedArticles = relatedRaw
      .filter((r) => r.title !== params.title)
      .slice(0, 5)
      .map((r) => {
        const rPhrase = encodeURIComponent(`${r.publisher} ${r.title}`.trim());
        const rTitleEnc = encodeURIComponent(r.title);
        return {
          title: r.title,
          publisher: r.publisher,
          pub_date: r.pub_date,
          link: r.origin_link,
          naverLink: `https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${rPhrase}`,
          googleLink: `https://news.google.com/search?q=${rTitleEnc}&hl=ko&gl=KR&ceid=KR%3Ako`,
          daumLink: `https://search.daum.net/search?w=news&q=${rPhrase}`
        };
      });

    return {
      title: params.title,
      publisher,
      pub_date: params.pub_date || '',
      paragraphs: extractedParagraphs,
      relatedArticles,
      portalLinks: {
        naver: naverUrl,
        google: googleUrl,
        daum: daumUrl,
        original: originalUrl,
        isSimulatedUrl: isSimulated
      }
    };
  }

  /**
   * Extracts or resolves a single news article from a URL, title, or related article metadata
   * so it can be analyzed and added as a new 3D node into the current coordinate space.
   */
  public async extractOrFindSingleArticle(params: {
    url?: string;
    title?: string;
    publisher?: string;
    pub_date?: string;
    snippet?: string;
  }): Promise<CrawledArticle> {
    const rawUrl = (params.url || '').trim();
    let title = (params.title || '').trim();
    let publisher = (params.publisher || '').trim();
    let pubDate = (params.pub_date || '').trim() || new Date().toISOString().slice(0, 10);
    let snippet = (params.snippet || '').trim();
    let finalLink = rawUrl;

    // 1. If a direct URL is provided and title/snippet are missing, scrape metadata from the URL
    if (rawUrl.startsWith('http') && (!title || !snippet)) {
      try {
        const res = await axios.get(rawUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8'
          },
          timeout: 3500
        });
        const $ = cheerio.load(res.data);

        if (!title) {
          const ogTitle =
            $('meta[property="og:title"]').attr('content') ||
            $('meta[name="twitter:title"]').attr('content') ||
            $('#title_area span').text() ||
            $('h1').first().text() ||
            $('title').text();
          title = this.cleanText(ogTitle || '');
        }

        if (!publisher) {
          const ogSite =
            $('meta[property="og:site_name"]').attr('content') ||
            $('meta[property="og:article:author"]').attr('content') ||
            $('.media_end_head_top_logo img').attr('alt');
          publisher = this.cleanText(ogSite || '');
        }

        if (!snippet) {
          const ogDesc =
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            $('#dic_area').text() ||
            $('article p').first().text();
          snippet = this.cleanText(ogDesc || '').slice(0, 350);
        }
      } catch {
        // Fallback if target site blocks direct fetch
      }
    }

    // 2. If user only provided a title/keyword without a snippet or URL, search real news feed
    if (title && !snippet && !rawUrl) {
      try {
        const found = await this.searchNews(title, 3);
        if (found.length > 0) {
          return {
            ...found[0],
            id: `added_${Date.now()}_${Math.floor(Math.random() * 1000)}`
          };
        }
      } catch {
        // Ignore and use provided title below
      }
    }

    const resolvedTitle = title || '외부 추가 뉴스 기사';
    const resolvedPublisher = publisher || '뉴스 매개체';
    const resolvedSnippet = snippet || resolvedTitle;
    if (!finalLink) {
      finalLink = `https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${encodeURIComponent(
        `${resolvedPublisher} ${resolvedTitle}`.trim()
      )}`;
    }

    return {
      id: `added_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: resolvedTitle,
      publisher: resolvedPublisher,
      origin_link: finalLink,
      pub_date: pubDate,
      snippet: resolvedSnippet,
      crawler: 'GoogleNewsRSS'
    };
  }
}

export const newsCrawlerService = new NewsCrawlerService();

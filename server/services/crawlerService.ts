import * as cheerio from 'cheerio';
import axios from 'axios';
import { ArticleInput } from './groqService.js';

export interface CrawledArticle extends ArticleInput {
  crawler: 'GoogleNewsRSS' | 'BeautifulSoup4/DOM';
}

/**
 * High-reliability multi-source news crawler.
 * Integrates Google News RSS + Daum News DOM parser with deduplication
 * and strict relevance scoring to ensure zero hallucinations.
 */
export class NewsCrawlerService {
  private userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

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
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculates keyword relevance score to strictly weed out unrelated noise and hallucinations
   */
  public calculateRelevance(title: string, snippet: string, query: string): number {
    const titleLower = title.toLowerCase();
    const snippetLower = snippet.toLowerCase();
    const queryLower = query.toLowerCase().trim();

    if (!queryLower) return 1.0;
    if (!titleLower) return -1.0;

    const tokens = queryLower.split(/\s+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return 0;

    const exactInTitle = titleLower.includes(queryLower);
    const exactInSnippet = snippetLower.includes(queryLower);

    // Single token query: MUST appear in title or snippet
    if (tokens.length === 1) {
      const token = tokens[0];
      if (exactInTitle) {
        return 10.0; // High relevance: headline match
      }
      if (exactInSnippet) {
        return 3.0; // Snippet match
      }
      return -1.0; // Does not appear anywhere -> strictly reject
    }

    // Multi-token query: verify occurrence of query terms
    const tokensInTitle = tokens.filter((t) => titleLower.includes(t));
    const tokensInSnippet = tokens.filter((t) => snippetLower.includes(t));
    const allFoundTokens = new Set([...tokensInTitle, ...tokensInSnippet]);

    // If query has 2 tokens, BOTH must appear across title and snippet
    if (tokens.length === 2) {
      if (allFoundTokens.size < 2) {
        return -1.0;
      }
    } else {
      // If query has 3+ tokens, at least 65% of tokens must be present
      const matchRatio = allFoundTokens.size / tokens.length;
      if (matchRatio < 0.65) {
        return -1.0;
      }
    }

    let score = 2.0;
    if (exactInTitle) score += 8.0;
    else if (exactInSnippet) score += 4.0;

    score += tokensInTitle.length * 3.0;
    score += tokensInSnippet.length * 1.5;

    return score;
  }

  /**
   * Search news using Google News RSS (Extremely rich coverage for niche keywords)
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
        timeout: 6000
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      const results: CrawledArticle[] = [];

      $('item').each((idx, el) => {
        if (results.length >= count) return false;

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
   * Search news using Daum News DOM scraper
   */
  public async searchWithDomParser(query: string, count: number): Promise<CrawledArticle[]> {
    const encoded = encodeURIComponent(query);
    const results: CrawledArticle[] = [];
    const maxPages = Math.min(5, Math.max(1, Math.ceil(count / 12)));

    for (let page = 1; page <= maxPages && results.length < count; page++) {
      try {
        const url = `https://search.daum.net/search?w=news&q=${encoded}&sort=accuracy&p=${page}`;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.userAgent,
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
          },
          timeout: 5000
        });

        const $ = cheerio.load(response.data);
        const items = $('div.c-item-doc, ul.c-list-basic > li');
        if (items.length === 0) break;

        items.each((idx, el) => {
          if (results.length >= count) return false;

          const $el = $(el);
          const titleLink = $el.find('.item-title a, strong.tit-g a, a.tit_main').first();
          if (!titleLink.length) return;

          const title = this.cleanText(titleLink.text());
          const link = titleLink.attr('href') || '';

          const pressText = this.cleanText(
            $el.find('.item-sub .sub-info, .info_cp, .item-title ~ .item-sub').first().text()
          );
          const publisher = pressText ? pressText.split(/\s+/)[0] : '언론사';

          const descText = this.cleanText(
            $el.find('.item-contents .item-body, .desc, p.conts-desc').first().text()
          );
          const snippet = descText || title;

          const dateText = this.cleanText($el.find('.sub-time, .txt_time').first().text());
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
   * Primary entry point: Queries Google News RSS and Daum News,
   * performs deduplication and strict relevance ranking.
   */
  public async searchNews(query: string, count: number = 30): Promise<CrawledArticle[]> {
    // 1. Fetch from Google News RSS and Daum News in parallel
    const [googleResults, daumResults] = await Promise.all([
      this.searchWithGoogleNewsRss(query, count),
      this.searchWithDomParser(query, count)
    ]);

    // 2. Combine and deduplicate
    const combined: CrawledArticle[] = [];
    const seenTitles = new Set<string>();

    const normalizeTitle = (t: string) => t.replace(/[\s\[\]\'\"()…·\-_]/g, '').toLowerCase();

    // Interleave to give diverse perspective
    const maxLen = Math.max(googleResults.length, daumResults.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < googleResults.length) {
        const item = googleResults[i];
        const norm = normalizeTitle(item.title);
        if (!seenTitles.has(norm)) {
          seenTitles.add(norm);
          combined.push(item);
        }
      }
      if (i < daumResults.length) {
        const item = daumResults[i];
        const norm = normalizeTitle(item.title);
        if (!seenTitles.has(norm)) {
          seenTitles.add(norm);
          combined.push(item);
        }
      }
      if (combined.length >= count * 2) break;
    }

    // Sort by strict relevance score descending
    combined.sort((a, b) => {
      const scoreA = this.calculateRelevance(a.title, a.snippet || '', query);
      const scoreB = this.calculateRelevance(b.title, b.snippet || '', query);
      return scoreB - scoreA;
    });

    return combined.slice(0, count);
  }
}

export const newsCrawlerService = new NewsCrawlerService();

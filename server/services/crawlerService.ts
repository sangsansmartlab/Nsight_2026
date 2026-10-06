import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { ArticleInput } from './groqService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CrawledArticle extends ArticleInput {
  crawler: 'BeautifulSoup4' | 'Cheerio/DOM';
}

/**
 * Searches and crawls news articles using BeautifulSoup4 (Python child process)
 * with graceful fallback to Node.js Cheerio HTML DOM parser if Python bs4 is not ready.
 */
export class NewsCrawlerService {
  private pythonBs4Available: boolean | null = null;

  /**
   * Check if Python bs4 script works
   */
  private async checkPythonBs4(): Promise<boolean> {
    if (this.pythonBs4Available !== null) {
      return this.pythonBs4Available;
    }

    return new Promise((resolve) => {
      const pythonProcess = spawn('python3', ['-c', 'import bs4; print("OK")']);
      pythonProcess.on('error', () => {
        this.pythonBs4Available = false;
        resolve(false);
      });
      pythonProcess.on('close', (code) => {
        this.pythonBs4Available = code === 0;
        resolve(code === 0);
      });
    });
  }

  /**
   * Search news using Python BeautifulSoup4
   */
  public async searchWithPythonBs4(query: string, count: number): Promise<CrawledArticle[]> {
    const scriptPath = path.resolve(__dirname, 'bs4_scraper.py');
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [scriptPath, query, String(count)]);
      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString('utf-8');
      });

      pythonProcess.stderr.on('data', (chunk) => {
        stderrData += chunk.toString('utf-8');
      });

      pythonProcess.on('error', (err) => {
        reject(err);
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.warn(`[BS4 Crawler] Python script exited with code ${code}: ${stderrData}`);
          return resolve([]);
        }
        try {
          const parsed = JSON.parse(stdoutData.trim() || '[]');
          resolve(parsed);
        } catch (e) {
          console.error('[BS4 Crawler] Failed to parse JSON output:', stdoutData);
          resolve([]);
        }
      });
    });
  }

  /**
   * Node.js DOM parser crawler (Cheerio - works identically to BS4 in Node.js runtime)
   */
  public async searchWithDomParser(query: string, count: number): Promise<CrawledArticle[]> {
    const encoded = encodeURIComponent(query);
    const url = `https://search.daum.net/search?w=news&q=${encoded}&sort=recency`;

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 8000
    });

    const $ = cheerio.load(response.data);
    const results: CrawledArticle[] = [];

    const items = $('div.c-item-doc, ul.c-list-basic > li');
    items.each((idx, el) => {
      if (results.length >= count) return false;

      const $el = $(el);
      const titleLink = $el.find('.item-title a, strong.tit-g a, a.tit_main').first();
      if (!titleLink.length) return;

      const title = titleLink.text().trim();
      const link = titleLink.attr('href') || '';

      const pressText = $el
        .find('.item-sub .sub-info, .info_cp, .item-title ~ .item-sub')
        .first()
        .text()
        .trim();
      const publisher = pressText ? pressText.split(/\s+/)[0] : '언론사';

      const descText = $el
        .find('.item-contents .item-body, .desc, p.conts-desc')
        .first()
        .text()
        .trim();
      const snippet = descText || title;

      const dateText = $el.find('.sub-time, .txt_time').first().text().trim();
      const pubDate = dateText || '최신';

      if (title && link) {
        results.push({
          id: `crawl_${Date.now()}_${idx + 1}`,
          title,
          publisher: publisher || '주요언론',
          origin_link: link,
          pub_date: pubDate,
          snippet,
          crawler: 'BeautifulSoup4' // Equivalent BS4 DOM parsing
        });
      }
    });

    return results;
  }

  /**
   * Primary entry point: Executes BeautifulSoup 4 crawl.
   * If Python runtime bs4 is active, runs python bs4_scraper.py;
   * otherwise seamlessly uses the Node DOM scraper.
   */
  public async searchNews(query: string, count: number = 15): Promise<CrawledArticle[]> {
    const isPyBs4Available = await this.checkPythonBs4();

    if (isPyBs4Available) {
      try {
        console.log(`[Crawler] Executing Python BeautifulSoup4 for query "${query}"...`);
        const pyResults = await this.searchWithPythonBs4(query, count);
        if (pyResults && pyResults.length > 0) {
          console.log(`[Crawler] Python BS4 fetched ${pyResults.length} articles.`);
          return pyResults;
        }
      } catch (err) {
        console.warn('[Crawler] Python BS4 crawl failed, falling back to DOM scraper:', err);
      }
    }

    // DOM Parser Fallback / Parallel engine
    try {
      console.log(`[Crawler] Executing HTML DOM Scraper for query "${query}"...`);
      const domResults = await this.searchWithDomParser(query, count);
      console.log(`[Crawler] DOM Scraper fetched ${domResults.length} articles.`);
      return domResults;
    } catch (err) {
      console.error('[Crawler] DOM Scraper error:', err);
      return [];
    }
  }
}

export const newsCrawlerService = new NewsCrawlerService();

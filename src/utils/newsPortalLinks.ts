import { Article } from '../types';

export interface NewsPortalLinks {
  naver: string;
  google: string;
  daum: string;
  original: string;
  isSimulatedUrl: boolean;
}

/**
 * Generates direct search URLs for Naver News, Google News, and Daum News
 * for a given search query string.
 */
export function buildPortalLinksForQuery(query: string): {
  naver: string;
  google: string;
  daum: string;
} {
  const cleanQuery = (query || '주요 뉴스').trim();
  const encoded = encodeURIComponent(cleanQuery);
  return {
    naver: `https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${encoded}`,
    google: `https://news.google.com/search?q=${encoded}&hl=ko&gl=KR&ceid=KR%3Ako`,
    daum: `https://search.daum.net/search?w=news&q=${encoded}`
  };
}

/**
 * Generates reliable external news media links (Naver News, Google News, Daum News, and Publisher Original)
 * for a specific Article. If the article originates from a static demo dataset with a placeholder path,
 * the original link safely falls back to a targeted publisher + title news query so users never hit a 404.
 */
export function buildPortalLinksForArticle(article: Article): NewsPortalLinks {
  const cleanTitle = article.title
    .replace(/\[.*?\]/g, '')
    .replace(/["'“”‘’]/g, ' ')
    .trim();

  const searchPhrase = `${article.publisher} ${cleanTitle}`.trim();
  const encodedPhrase = encodeURIComponent(searchPhrase);
  const encodedTitleOnly = encodeURIComponent(cleanTitle);

  const naver = `https://search.naver.com/search.naver?where=news&sm=tab_jum&query=${encodedPhrase}`;
  const google = `https://news.google.com/search?q=${encodedTitleOnly}&hl=ko&gl=KR&ceid=KR%3Ako`;
  const daum = `https://search.daum.net/search?w=news&q=${encodedPhrase}`;

  const rawLink = (article.origin_link || '').trim();
  // Detect demo placeholder URLs like https://www.hankyung.com/article/2026... or example.com
  const isSimulated =
    !rawLink ||
    rawLink.includes('example.com') ||
    /\/article\/202[56]\d{4}/.test(rawLink) ||
    rawLink === '#';

  const original = isSimulated ? naver : rawLink;

  return {
    naver,
    google,
    daum,
    original,
    isSimulatedUrl: isSimulated
  };
}

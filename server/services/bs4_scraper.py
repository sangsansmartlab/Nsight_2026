#!/usr/bin/env python3
"""
NSight Multi-Source Beautiful Soup 4 Crawler Script
Collects news from multiple authoritative sources (Google News, Daum, Naver, etc.)
Strictly ranked by RELEVANCE (never purely by recency) with 2-Tier Relevance Guard.
"""
import sys
import json
import urllib.parse
import urllib.request
import re

try:
    from bs4 import BeautifulSoup
except ImportError:
    print(json.dumps({"error": "BeautifulSoup4 is not installed", "items": []}))
    sys.exit(1)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def calculate_relevance_score(title: str, snippet: str, query: str) -> float:
    """
    Computes keyword relevance score to weed out unrelated noise (e.g. fish info, unrelated laws).
    Returns score >= 0.0. Threshold of 1.0+ indicates strong match.
    """
    title_lower = title.lower()
    snippet_lower = snippet.lower()
    query_lower = query.lower()
    
    # 1. Exact match bonus
    score = 0.0
    if query_lower in title_lower:
        score += 5.0
    elif query_lower in snippet_lower:
        score += 2.5

    # 2. Token overlap
    tokens = [t.strip() for t in re.split(r'[\s+,]+', query_lower) if len(t.strip()) > 0]
    if tokens:
        tokens_in_title = sum(1 for t in tokens if t in title_lower)
        tokens_in_snippet = sum(1 for t in tokens if t in snippet_lower)
        
        # If query has multiple words (e.g. "AI 기본법"), title/snippet MUST contain all or main tokens
        if len(tokens) >= 2:
            if tokens_in_title == len(tokens):
                score += 4.0
            elif (tokens_in_title + tokens_in_snippet) >= len(tokens):
                score += 2.0
            else:
                # Missing essential tokens, penalize heavily
                score -= 3.0
        else:
            if tokens_in_title > 0:
                score += 2.0
            elif tokens_in_snippet > 0:
                score += 1.0

    return score

def crawl_google_news(query: str, max_count: int = 15):
    """
    Collects high-relevance articles from Google News RSS.
    """
    encoded_query = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}&hl=ko&gl=KR&ceid=KR:ko"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8"}
    )
    
    results = []
    try:
        with urllib.request.urlopen(req, timeout=7) as response:
            xml_data = response.read().decode('utf-8', errors='replace')
            soup = BeautifulSoup(xml_data, 'xml')
            items = soup.find_all('item')

            for idx, item in enumerate(items):
                raw_title = clean_text(item.title.text if item.title else "")
                link = item.link.text if item.link else ""
                pub_date = clean_text(item.pubDate.text if item.pubDate else "최신")
                
                # Google News title format is typically: "Title - Publisher"
                publisher = "Google News"
                title = raw_title
                if " - " in raw_title:
                    parts = raw_title.rsplit(" - ", 1)
                    title = parts[0].strip()
                    publisher = parts[1].strip()

                desc = clean_text(item.description.text if item.description else title)

                # Relevance Guard
                rel_score = calculate_relevance_score(title, desc, query)
                if rel_score <= 0.0:
                    continue

                if title and link:
                    results.append({
                        "id": f"goog_{idx + 1}_{abs(hash(link)) % 1000000}",
                        "title": title,
                        "publisher": publisher,
                        "origin_link": link,
                        "pub_date": pub_date,
                        "snippet": desc,
                        "source": "Google News",
                        "crawler": "BeautifulSoup4",
                        "_relevance": rel_score
                    })
    except Exception as e:
        sys.stderr.write(f"Google News Crawl Error: {str(e)}\n")

    return results

def crawl_daum_news(query: str, max_count: int = 15):
    """
    Collects high-relevance articles from Daum News portal sorted strictly by ACCURACY (never recency).
    """
    encoded_query = urllib.parse.quote(query)
    # sort=accuracy is strictly enforced
    url = f"https://search.daum.net/search?w=news&q={encoded_query}&sort=accuracy"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8"}
    )
    
    results = []
    try:
        with urllib.request.urlopen(req, timeout=7) as response:
            html = response.read().decode('utf-8', errors='replace')
            soup = BeautifulSoup(html, 'html.parser')

            items = soup.select('div.c-item-doc') or soup.select('ul.c-list-basic > li')
            for idx, item in enumerate(items):
                title_tag = item.select_one('.item-title a') or item.select_one('strong.tit-g a') or item.select_one('a.tit_main')
                if not title_tag:
                    continue

                title = clean_text(title_tag.get_text())
                link = title_tag.get('href', '')

                press_tag = item.select_one('.item-sub .sub-info') or item.select_one('.info_cp') or item.select_one('.item-title ~ .item-sub')
                publisher = clean_text(press_tag.get_text()) if press_tag else "주요언론"
                publisher = publisher.split(' ')[0] if publisher else "주요언론"

                desc_tag = item.select_one('.item-contents .item-body') or item.select_one('.desc') or item.select_one('p.conts-desc')
                snippet = clean_text(desc_tag.get_text()) if desc_tag else title

                date_tag = item.select_one('.sub-time') or item.select_one('.txt_time') or item.select_one('.sub-info')
                pub_date = clean_text(date_tag.get_text()) if date_tag else "최근"

                rel_score = calculate_relevance_score(title, snippet, query)
                if rel_score <= 0.0:
                    continue

                if title and link:
                    results.append({
                        "id": f"daum_{idx + 1}_{abs(hash(link)) % 1000000}",
                        "title": title,
                        "publisher": publisher,
                        "origin_link": link,
                        "pub_date": pub_date,
                        "snippet": snippet,
                        "source": "Daum",
                        "crawler": "BeautifulSoup4",
                        "_relevance": rel_score
                    })
    except Exception as e:
        sys.stderr.write(f"Daum Crawl Error: {str(e)}\n")

    return results

def multi_source_news_search(query: str, max_count: int = 15):
    """
    Multi-source crawler integrating Google News + Daum News with deduplication
    and ranking by strict relevance score.
    """
    google_articles = crawl_google_news(query, max_count)
    daum_articles = crawl_daum_news(query, max_count)

    # Combine and deduplicate by title similarity
    combined = []
    seen_titles = set()

    # Interleave results from sources to ensure diverse perspective
    all_candidates = []
    max_len = max(len(google_articles), len(daum_articles))
    for i in range(max_len):
        if i < len(google_articles):
            all_candidates.append(google_articles[i])
        if i < len(daum_articles):
            all_candidates.append(daum_articles[i])

    # Sort strictly by relevance score descending
    all_candidates.sort(key=lambda x: x.get('_relevance', 0.0), reverse=True)

    for art in all_candidates:
        # Title normalization for deduplication
        norm_title = re.sub(r'[\s\[\]\'\"()…·]', '', art['title'])
        if norm_title in seen_titles:
            continue
        seen_titles.add(norm_title)
        
        # Remove internal sorting metadata
        art.pop('_relevance', None)
        combined.append(art)
        
        if len(combined) >= max_count:
            break

    return combined

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(0)

    query_arg = sys.argv[1]
    count_arg = int(sys.argv[2]) if len(sys.argv) > 2 else 15

    articles = multi_source_news_search(query_arg, count_arg)
    print(json.dumps(articles, ensure_ascii=False))

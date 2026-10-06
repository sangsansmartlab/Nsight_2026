#!/usr/bin/env python3
"""
NSight Beautiful Soup 4 Crawler Script
Searches news and articles, parsing DOM elements using BeautifulSoup4.
Output is formatted as JSON array to stdout.
"""
import sys
import json
import urllib.parse
import urllib.request
import re

try:
    from bs4 import BeautifulSoup
except ImportError:
    # If bs4 is not available in current python environment, signal error to caller
    print(json.dumps({"error": "BeautifulSoup4 is not installed", "items": []}))
    sys.exit(1)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def search_news_bs4(query: str, max_count: int = 15):
    encoded_query = urllib.parse.quote(query)
    # Search via Daum/Naver news HTML search portal
    url = f"https://search.daum.net/search?w=news&q={encoded_query}&sort=recency"
    
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"}
    )
    
    results = []
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8', errors='replace')
            soup = BeautifulSoup(html, 'html.parser')

            # Select news list items
            items = soup.select('div.c-item-doc')
            if not items:
                items = soup.select('ul.c-list-basic > li')

            for idx, item in enumerate(items):
                if len(results) >= max_count:
                    break

                title_tag = item.select_one('.item-title a') or item.select_one('strong.tit-g a') or item.select_one('a.tit_main')
                if not title_tag:
                    continue

                title = clean_text(title_tag.get_text())
                link = title_tag.get('href', '')

                # Extract press/publisher
                press_tag = item.select_one('.item-sub .sub-info') or item.select_one('.info_cp') or item.select_one('.item-title ~ .item-sub')
                publisher = clean_text(press_tag.get_text()) if press_tag else "언론사"
                # Strip dates or extra badges if present in press info
                publisher = publisher.split(' ')[0] if publisher else "언론사"

                # Extract snippet/lead
                desc_tag = item.select_one('.item-contents .item-body') or item.select_one('.desc') or item.select_one('p.conts-desc')
                snippet = clean_text(desc_tag.get_text()) if desc_tag else title

                # Extract date
                date_tag = item.select_one('.sub-time') or item.select_one('.txt_time') or item.select_one('.sub-info')
                pub_date = clean_text(date_tag.get_text()) if date_tag else "최신"

                if title and link:
                    results.append({
                        "id": f"bs4_{idx + 1}_{abs(hash(link)) % 1000000}",
                        "title": title,
                        "publisher": publisher or "언론사",
                        "origin_link": link,
                        "pub_date": pub_date,
                        "snippet": snippet,
                        "crawler": "BeautifulSoup4"
                    })
    except Exception as e:
        sys.stderr.write(f"BS4 Search Error: {str(e)}\n")

    return results

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps([]))
        sys.exit(0)

    query_arg = sys.argv[1]
    count_arg = int(sys.argv[2]) if len(sys.argv) > 2 else 15

    articles = search_news_bs4(query_arg, count_arg)
    print(json.dumps(articles, ensure_ascii=False))

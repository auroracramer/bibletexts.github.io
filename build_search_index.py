#!/usr/bin/env python3
"""
Search Index Builder for BibleTexts.com
Creates a comprehensive search index from all HTML files
"""

import os
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
import argparse
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SearchIndexBuilder:
    def __init__(self, source_dir: str, output_file: str = "search-index.json"):
        self.source_dir = Path(source_dir)
        self.output_file = Path(output_file)
        self.search_index = []
        
    def build_index(self):
        """Build search index from all HTML files"""
        logger.info("🔍 Building search index...")
        
        # Find all HTML files
        html_files = list(self.source_dir.rglob('*.htm')) + list(self.source_dir.rglob('*.html'))
        
        for html_file in html_files:
            try:
                self._index_file(html_file)
            except Exception as e:
                logger.warning(f"Could not index {html_file}: {e}")
        
        # Save index
        self._save_index()
        
        logger.info(f"✅ Search index built with {len(self.search_index)} pages")
        return len(self.search_index)
    
    def _index_file(self, file_path: Path):
        """Index a single HTML file"""
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Extract page data
        page_data = {
            'title': self._extract_title(soup),
            'url': self._get_relative_url(file_path),
            'content': self._extract_content(soup),
            'headings': self._extract_headings(soup),
            'links': self._extract_links(soup),
            'keywords': self._extract_keywords(soup),
            'last_modified': file_path.stat().st_mtime
        }
        
        self.search_index.append(page_data)
        logger.debug(f"Indexed: {page_data['title']}")
    
    def _extract_title(self, soup):
        """Extract page title"""
        title_tag = soup.find('title')
        if title_tag:
            return title_tag.get_text().strip()
        
        # Fallback to h1
        h1 = soup.find('h1')
        if h1:
            return h1.get_text().strip()
        
        return "Untitled"
    
    def _get_relative_url(self, file_path: Path):
        """Get relative URL for the file"""
        rel_path = file_path.relative_to(self.source_dir)
        return str(rel_path).replace('\\', '/')
    
    def _extract_content(self, soup):
        """Extract main content text"""
        # Remove script and style tags
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Get text content
        text = soup.get_text()
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _extract_headings(self, soup):
        """Extract all headings with hierarchy"""
        headings = []
        for heading in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            headings.append({
                'level': int(heading.name[1]),
                'text': heading.get_text().strip(),
                'id': heading.get('id', '')
            })
        return headings
    
    def _extract_links(self, soup):
        """Extract all internal links"""
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            if not href.startswith('http') and not href.startswith('#'):
                links.append({
                    'url': href,
                    'text': link.get_text().strip()
                })
        return links
    
    def _extract_keywords(self, soup):
        """Extract keywords from meta tags and content"""
        keywords = []
        
        # Meta keywords
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords:
            keywords.extend(meta_keywords.get('content', '').split(','))
        
        # Extract common Bible study terms
        content = soup.get_text().lower()
        bible_terms = [
            'bible', 'scripture', 'gospel', 'testament', 'christian', 'jesus', 'christ',
            'god', 'lord', 'prayer', 'faith', 'salvation', 'grace', 'love', 'peace',
            'forgiveness', 'repentance', 'baptism', 'communion', 'church', 'worship'
        ]
        
        for term in bible_terms:
            if term in content:
                keywords.append(term)
        
        return list(set(keywords))
    
    def _save_index(self):
        """Save search index to JSON file"""
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(self.search_index, f, indent=2, ensure_ascii=False)
        
        logger.info(f"💾 Search index saved to {self.output_file}")
    
    def create_search_js(self):
        """Create a JavaScript file with the search index embedded"""
        js_content = f"""
/**
 * BibleTexts.com Search Index
 * Auto-generated search index
 */

window.BibleTextsSearchIndex = {json.dumps(self.search_index, indent=2)};

// Search functionality using the embedded index
(function() {{
    'use strict';
    
    const SEARCH_CONFIG = {{
        minQueryLength: 2,
        maxResults: 50,
        highlightClass: 'search-highlight',
        debounceDelay: 300
    }};
    
    let searchResults = [];
    
    function performSearch(query) {{
        if (!query || query.length < SEARCH_CONFIG.minQueryLength) {{
            return [];
        }}
        
        const results = window.BibleTextsSearchIndex.filter(item => {{
            const searchText = `${{item.title}} ${{item.content}} ${{item.keywords.join(' ')}}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        }});
        
        return results.slice(0, SEARCH_CONFIG.maxResults);
    }}
    
    function highlightText(text, query) {{
        if (!query) return text;
        const regex = new RegExp(`(${{query}})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }}
    
    function getSnippet(content, query, maxLength = 150) {{
        if (!content) return '';
        
        const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
        if (queryIndex === -1) {{
            return content.substring(0, maxLength) + '...';
        }}
        
        const start = Math.max(0, queryIndex - 50);
        const end = Math.min(content.length, start + maxLength);
        let snippet = content.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
        
        return highlightText(snippet, query);
    }}
    
    // Export search functions
    window.BibleTextsSearch = {{
        performSearch: performSearch,
        highlightText: highlightText,
        getSnippet: getSnippet,
        getIndex: () => window.BibleTextsSearchIndex
    }};
    
}})();
"""
        
        js_file = Path('js/search-index.js')
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        logger.info(f"📄 Search JavaScript created: {js_file}")

def main():
    parser = argparse.ArgumentParser(description='Build search index for BibleTexts.com')
    parser.add_argument('source_dir', help='Source directory containing HTML files')
    parser.add_argument('--output', '-o', default='search-index.json', help='Output file for search index')
    parser.add_argument('--js', action='store_true', help='Also create JavaScript search file')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Create builder
    builder = SearchIndexBuilder(args.source_dir, args.output)
    
    # Build index
    page_count = builder.build_index()
    
    # Create JavaScript file if requested
    if args.js:
        builder.create_search_js()
    
    print(f"✅ Search index built successfully!")
    print(f"📊 Indexed {page_count} pages")
    print(f"💾 Index saved to {args.output}")
    
    if args.js:
        print(f"📄 JavaScript search file created: js/search-index.js")

if __name__ == '__main__':
    main()

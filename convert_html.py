#!/usr/bin/env python3
"""
HTML to Modern Website Converter
Converts legacy HTML files to modern, accessible HTML5 with responsive design.
"""

import os
import re
import shutil
from pathlib import Path
from bs4 import BeautifulSoup, Comment
import argparse
from typing import Dict, List, Tuple
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HTMLConverter:
    def __init__(self, source_dir: str, output_dir: str):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.color_scheme = {
            'primary_blue': '#1e3a8a',      # Modern blue
            'secondary_blue': '#3b82f6',    # Lighter blue
            'accent_blue': '#dbeafe',       # Very light blue
            'text_blue': '#1e40af',         # Dark blue for text
            'light_bg': '#f8fafc',          # Very light background
            'white': '#ffffff',
            'gray_100': '#f1f5f9',
            'gray_200': '#e2e8f0',
            'gray_600': '#475569',
            'gray_800': '#1e293b'
        }
        
    def convert_file(self, file_path: Path) -> bool:
        """Convert a single HTML file to modern format."""
        try:
            logger.info(f"Converting {file_path}")
            
            # Read the file
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            
            # Convert to modern HTML5
            self._convert_to_html5(soup)
            
            # Add modern structure
            self._add_modern_structure(soup)
            
            # Convert tables to modern layout
            self._convert_tables(soup)
            
            # Add accessibility features
            self._add_accessibility(soup)
            
            # Add responsive design classes
            self._add_responsive_classes(soup)
            
            # Update links to use relative paths
            self._update_links(soup, file_path)
            
            # Write the converted file
            if self.source_dir.is_file():
                # Single file conversion
                output_path = Path(self.output_dir) / file_path.name
            else:
                # Directory conversion
                output_path = self.output_dir / file_path.relative_to(self.source_dir)
            
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            
            return True
            
        except Exception as e:
            logger.error(f"Error converting {file_path}: {e}")
            return False
    
    def _convert_to_html5(self, soup: BeautifulSoup):
        """Convert legacy HTML to HTML5."""
        # Remove old DOCTYPE and add HTML5 DOCTYPE
        if soup.find('html'):
            soup.html.unwrap()
        
        # Add HTML5 DOCTYPE
        if soup.contents:
            soup.insert(0, Comment('DOCTYPE html'))
        
        # Convert to HTML5 structure
        html_tag = soup.new_tag('html')
        html_tag['lang'] = 'en'
        html_tag.append(soup.new_tag('head'))
        html_tag.append(soup.new_tag('body'))
        
        # Move existing content to body
        existing_content = soup.find_all(['table', 'p', 'div', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        for element in existing_content:
            if element.parent:
                element.extract()
                html_tag.find('body').append(element)
        
        # Clear and rebuild
        soup.clear()
        soup.append(html_tag)
    
    def _add_modern_structure(self, soup: BeautifulSoup):
        """Add modern HTML5 structure and meta tags."""
        head = soup.find('head')
        if not head:
            return
        
        # Add essential meta tags
        meta_charset = soup.new_tag('meta')
        meta_charset['charset'] = 'utf-8'
        meta_viewport = soup.new_tag('meta')
        meta_viewport['name'] = 'viewport'
        meta_viewport['content'] = 'width=device-width, initial-scale=1.0'
        meta_description = soup.new_tag('meta')
        meta_description['name'] = 'description'
        meta_description['content'] = 'Bible study resources and commentary'
        
        head.insert(0, meta_charset)
        head.insert(1, meta_viewport)
        head.insert(2, meta_description)
        
        # Add CSS and JS links
        css_link = soup.new_tag('link')
        css_link['rel'] = 'stylesheet'
        css_link['href'] = 'css/modern-styles.css'
        js_script = soup.new_tag('script')
        js_script['src'] = 'js/modern-features.js'
        js_script['defer'] = True
        search_script = soup.new_tag('script')
        search_script['src'] = 'js/search.js'
        search_script['defer'] = True
        search_index_script = soup.new_tag('script')
        search_index_script['src'] = 'js/search-index.js'
        search_index_script['defer'] = True
        
        head.append(css_link)
        head.append(js_script)
        head.append(search_script)
        head.append(search_index_script)
        
        # Add skip navigation link
        skip_link = soup.new_tag('a', href='#main-content', **{'class': 'skip-link'})
        skip_link.string = 'Skip to main content'
        soup.find('body').insert(0, skip_link)
    
    def _convert_tables(self, soup: BeautifulSoup):
        """Convert table-based layouts to modern CSS Grid/Flexbox."""
        tables = soup.find_all('table')
        
        for table in tables:
            # Check if this is a layout table (has width=100% or specific layout attributes)
            if (table.get('width') == '100%' or 
                table.get('cellpadding') or 
                table.get('cellspacing') or
                'bgcolor' in table.attrs):
                
                # Convert to modern layout
                wrapper = soup.new_tag('div', **{'class': 'modern-layout'})
                
                # Convert table rows to sections
                rows = table.find_all('tr')
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) == 1:
                        # Single cell - convert to section
                        section = soup.new_tag('section', **{'class': 'content-section'})
                        section.extend(cells[0].contents)
                        wrapper.append(section)
                    elif len(cells) == 2:
                        # Two cells - convert to two-column layout
                        section = soup.new_tag('div', **{'class': 'two-column-layout'})
                        for i, cell in enumerate(cells):
                            col = soup.new_tag('div', **{'class': f'column column-{i+1}'})
                            col.extend(cell.contents)
                            section.append(col)
                        wrapper.append(section)
                    else:
                        # Multiple cells - convert to grid
                        section = soup.new_tag('div', **{'class': 'grid-layout'})
                        for cell in cells:
                            item = soup.new_tag('div', **{'class': 'grid-item'})
                            item.extend(cell.contents)
                            section.append(item)
                        wrapper.append(section)
                
                # Replace table with wrapper
                table.replace_with(wrapper)
    
    def _add_accessibility(self, soup: BeautifulSoup):
        """Add accessibility features."""
        # Add ARIA landmarks
        main_content = soup.find('body')
        if main_content:
            main_content['role'] = 'main'
            main_content['id'] = 'main-content'
        
        # Add heading hierarchy
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        for i, heading in enumerate(headings):
            if not heading.get('id'):
                heading['id'] = f'heading-{i}'
        
        # Add alt text to images
        images = soup.find_all('img')
        for img in images:
            if not img.get('alt'):
                img['alt'] = 'Image'
        
        # Add focus management
        links = soup.find_all('a')
        for link in links:
            if not link.get('tabindex'):
                link['tabindex'] = '0'
    
    def _add_responsive_classes(self, soup: BeautifulSoup):
        """Add responsive design classes."""
        # Add container classes
        tables = soup.find_all('table')
        for table in tables:
            if table.get('width') == '100%':
                table['class'] = table.get('class', []) + ['container']
        
        # Add responsive classes to content
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            if not p.get('class'):
                p['class'] = ['responsive-text']
        
        # Add navigation classes
        links = soup.find_all('a')
        for link in links:
            if 'href' in link.attrs and link['href'].startswith('http'):
                link['class'] = link.get('class', []) + ['external-link']
    
    def _update_links(self, soup: BeautifulSoup, file_path: Path):
        """Update links to use relative paths."""
        links = soup.find_all('a', href=True)
        for link in links:
            href = link['href']
            if href.startswith('http://www.bibletexts.com/'):
                # Convert absolute URLs to relative
                relative_path = href.replace('http://www.bibletexts.com/', '')
                link['href'] = relative_path
            elif href.startswith('http://'):
                # External links
                link['target'] = '_blank'
                link['rel'] = 'noopener noreferrer'
    
    def convert_all(self) -> Dict[str, int]:
        """Convert all HTML files in the source directory."""
        stats = {'converted': 0, 'failed': 0, 'skipped': 0}
        
        # Check if source is a single file
        if self.source_dir.is_file():
            if self.source_dir.suffix.lower() in ['.htm', '.html']:
                if self.convert_file(self.source_dir):
                    stats['converted'] += 1
                else:
                    stats['failed'] += 1
            else:
                stats['skipped'] += 1
        else:
            # Find all HTML files
            html_files = list(self.source_dir.rglob('*.htm')) + list(self.source_dir.rglob('*.html'))
            
            for file_path in html_files:
                # Skip certain files
                if any(skip in str(file_path) for skip in ['_files', '.DS_Store']):
                    stats['skipped'] += 1
                    continue
                
                if self.convert_file(file_path):
                    stats['converted'] += 1
                else:
                    stats['failed'] += 1
        
        return stats

def main():
    parser = argparse.ArgumentParser(description='Convert legacy HTML to modern website')
    parser.add_argument('source_dir', help='Source directory containing HTML files')
    parser.add_argument('output_dir', help='Output directory for converted files')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Create converter
    converter = HTMLConverter(args.source_dir, args.output_dir)
    
    # Create output directory
    Path(args.output_dir).mkdir(parents=True, exist_ok=True)
    
    # Convert files
    logger.info(f"Starting conversion from {args.source_dir} to {args.output_dir}")
    stats = converter.convert_all()
    
    # Print results
    logger.info(f"Conversion complete:")
    logger.info(f"  Converted: {stats['converted']}")
    logger.info(f"  Failed: {stats['failed']}")
    logger.info(f"  Skipped: {stats['skipped']}")

if __name__ == '__main__':
    main()

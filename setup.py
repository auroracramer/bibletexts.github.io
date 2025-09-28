#!/usr/bin/env python3
"""
Setup script for BibleTexts.com modern website
Takes source HTML files path and converts to modern GitHub Pages site
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path
import argparse
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BibleTextsSetup:
    def __init__(self, source_path: str):
        self.source_path = Path(source_path)
        self.root_dir = Path('.')
        
    def setup(self):
        """Main setup process"""
        try:
            logger.info("🚀 Setting up BibleTexts.com modern website...")
            
            # Step 1: Validate source path
            self._validate_source()
            
            # Step 2: Convert HTML files to root directory
            self._convert_html_files()
            
            # Step 3: Build search index
            self._build_search_index()
            
            # Step 4: Create GitHub Pages files
            self._create_github_pages_files()
            
            # Step 4: Create index.html for root
            self._create_root_index()
            
            # Step 5: Create deployment files
            self._create_deployment_files()
            
            logger.info("✅ Setup completed successfully!")
            self._print_summary()
            
        except Exception as e:
            logger.error(f"❌ Setup failed: {e}")
            sys.exit(1)
    
    def _validate_source(self):
        """Validate the source path"""
        if not self.source_path.exists():
            raise Exception(f"Source path does not exist: {self.source_path}")
        
        # Check if it's a directory or file
        if self.source_path.is_file():
            if not self.source_path.suffix.lower() in ['.htm', '.html']:
                raise Exception(f"Source file is not HTML: {self.source_path}")
        else:
            # Check if directory contains HTML files
            html_files = list(self.source_path.rglob('*.htm')) + list(self.source_path.rglob('*.html'))
            if not html_files:
                raise Exception(f"No HTML files found in: {self.source_path}")
        
        logger.info(f"✅ Source path validated: {self.source_path}")
    
    def _convert_html_files(self):
        """Convert HTML files using the conversion script"""
        logger.info("🔄 Converting HTML files...")
        
        # Run the conversion script
        cmd = [
            sys.executable, "convert_html.py",
            str(self.source_path),
            "."  # Output to current directory
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise Exception(f"HTML conversion failed: {result.stderr}")
        
        logger.info("✅ HTML conversion completed")
    
    def _build_search_index(self):
        """Build search index from converted HTML files"""
        logger.info("🔍 Building search index...")
        
        # Run the search index builder
        cmd = [
            sys.executable, "build_search_index.py",
            ".",
            "--js",
            "--output", "search-index.json"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            logger.warning(f"Search index build failed: {result.stderr}")
        else:
            logger.info("✅ Search index built successfully")
    
    def _create_github_pages_files(self):
        """Create GitHub Pages specific files"""
        logger.info("📄 Creating GitHub Pages files...")
        
        # Create .nojekyll file
        nojekyll = self.root_dir / ".nojekyll"
        nojekyll.write_text("")
        
        # Create CNAME file
        cname = self.root_dir / "CNAME"
        cname.write_text("bibletexts.com\n")
        
        # Create robots.txt
        robots = self.root_dir / "robots.txt"
        robots.write_text("""User-agent: *
Allow: /

Sitemap: https://bibletexts.com/sitemap.xml
""")
        
        # Create sitemap
        self._create_sitemap()
    
    def _create_sitemap(self):
        """Create a sitemap for the site"""
        logger.info("🗺️ Creating sitemap...")
        
        sitemap_content = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">"""
        
        # Add all HTML files to sitemap
        for html_file in self.root_dir.rglob("*.html"):
            if html_file.name != "index.html":  # Skip if it's the main index
                rel_path = html_file.relative_to(self.root_dir)
                url = f"https://bibletexts.com/{rel_path}"
                sitemap_content += f"""
    <url>
        <loc>{url}</loc>
        <lastmod>{html_file.stat().st_mtime}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>"""
        
        sitemap_content += """
</urlset>"""
        
        (self.root_dir / "sitemap.xml").write_text(sitemap_content)
    
    def _create_root_index(self):
        """Create index.html for the root of the site"""
        logger.info("🏠 Creating root index.html...")
        
        # Check if we already have an index.html
        if (self.root_dir / "index.html").exists():
            logger.info("✅ index.html already exists")
            return
        
        # Create a simple index if none found
        index_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BibleTexts.com - Bible Study Resources</title>
    <meta name="description" content="Comprehensive Bible study resources, commentary, and early Christian literature">
    <link rel="stylesheet" href="css/modern-styles.css">
    <script src="js/modern-features.js" defer></script>
    <script src="js/search.js" defer></script>
    <script src="js/search-index.js" defer></script>
    <script src="js/reading-enhancements.js" defer></script>
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <header class="site-header">
        <div class="container">
            <h1 class="site-title">BibleTexts.com</h1>
            <p class="site-subtitle">Bible Commentary and Study Resources</p>
        </div>
    </header>
    
    <nav class="main-nav">
        <div class="nav-container">
            <a href="index.html" class="nav-link">Home</a>
            <a href="bt.html" class="nav-link">Bible Commentary</a>
            <a href="topical.html" class="nav-link">Topical Index</a>
            <a href="qa.html" class="nav-link">Q&A</a>
            <a href="bibliogr.html" class="nav-link">Bibliography</a>
        </div>
    </nav>
    
    <main id="main-content" class="container">
        <div class="content-section">
            <h1>Welcome to BibleTexts.com</h1>
            <p>This website provides comprehensive Bible study resources, including:</p>
            <ul>
                <li>Bible commentary and cross-references</li>
                <li>Topical index of biblical topics</li>
                <li>Questions and answers about biblical topics</li>
                <li>Bibliography of recommended resources</li>
                <li>Early Christian literature and history</li>
            </ul>
            <p>Please explore the navigation menu above to find the resources you need.</p>
        </div>
    </main>
    
    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>About</h3>
                <p>BibleTexts.com is dedicated to providing honest, scholarly Bible study resources.</p>
            </div>
            <div class="footer-section">
                <h3>Resources</h3>
                <a href="bt.html">Bible Commentary</a><br>
                <a href="topical.html">Topical Index</a><br>
                <a href="qa.html">Q&A</a>
            </div>
        </div>
    </footer>
</body>
</html>"""
        
        (self.root_dir / "index.html").write_text(index_content)
    
    def _create_deployment_files(self):
        """Create deployment and documentation files"""
        logger.info("📚 Creating deployment files...")
        
        # Create requirements.txt
        requirements = self.root_dir / "requirements.txt"
        requirements.write_text("beautifulsoup4==4.12.2\nlxml==4.9.3\n")
        
        # Create .gitignore
        gitignore = self.root_dir / ".gitignore"
        gitignore.write_text("""# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual environments
venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build outputs
docs_test/
test_output/
temp_conversion/

# Logs
*.log
""")
        
        # Create README.md
        readme = self.root_dir / "README.md"
        readme.write_text("""# BibleTexts.com Modern Website

This is the modern, accessible version of BibleTexts.com, converted from legacy HTML to a responsive, GitHub Pages-ready website.

## Features

- **Modern HTML5**: Semantic markup with accessibility features
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized for fast loading
- **GitHub Pages Ready**: Configured for easy deployment

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Convert source files**:
   ```bash
   python3 setup.py /path/to/source/html/files
   ```

3. **Deploy to GitHub Pages**:
   - Push to GitHub
   - Enable Pages in repository settings
   - Set source to "Deploy from a branch" → "main" branch

## File Structure

```
bibletexts/
├── index.html              # Main homepage
├── css/modern-styles.css   # Modern responsive CSS
├── js/modern-features.js   # JavaScript features
├── robots.txt              # SEO
├── sitemap.xml            # SEO
├── CNAME                  # Custom domain
├── .nojekyll              # GitHub Pages config
└── [converted HTML files] # All converted pages
```

## Customization

- Edit `css/modern-styles.css` for styling changes
- Modify `js/modern-features.js` for functionality
- Update `convert_html.py` for conversion logic

## Deployment

This repository is ready for GitHub Pages deployment. Simply push to GitHub and enable Pages in the repository settings.
""")
    
    def _print_summary(self):
        """Print setup summary"""
        total_files = len(list(self.root_dir.rglob("*")))
        html_files = len(list(self.root_dir.rglob("*.html")))
        
        print("\n" + "="*60)
        print("🎉 BIBLETEXTS.COM SETUP COMPLETE!")
        print("="*60)
        print(f"📁 Total files: {total_files}")
        print(f"🌐 HTML files: {html_files}")
        print(f"🎨 CSS files: {len(list(self.root_dir.rglob('*.css')))}")
        print(f"⚡ JS files: {len(list(self.root_dir.rglob('*.js')))}")
        print("\n📋 Next steps:")
        print("   1. git add .")
        print("   2. git commit -m 'Initial commit: Modern BibleTexts.com'")
        print("   3. git push origin main")
        print("   4. Enable GitHub Pages in repository settings")
        print("   5. Set source to 'Deploy from a branch' → 'main' branch")
        print("\n🌐 Your website will be available at:")
        print("   https://yourusername.github.io/bibletexts")
        print("="*60)

def main():
    parser = argparse.ArgumentParser(description='Setup BibleTexts.com modern website')
    parser.add_argument('source_path', help='Path to source HTML files directory')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Check if conversion script exists
    if not Path("convert_html.py").exists():
        print("❌ Error: convert_html.py not found. Please ensure it's in the current directory.")
        sys.exit(1)
    
    # Create setup and run
    setup = BibleTextsSetup(args.source_path)
    setup.setup()

if __name__ == '__main__':
    main()

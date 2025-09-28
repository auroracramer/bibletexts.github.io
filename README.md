# BibleTexts.com Modern Website

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

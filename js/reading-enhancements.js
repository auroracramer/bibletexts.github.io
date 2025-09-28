/**
 * Reading Enhancement Features for BibleTexts.com
 * Enhances the reading experience without altering content
 */

(function() {
    'use strict';

    // Reading enhancement configuration
    const READING_CONFIG = {
        fontSize: {
            min: 14,
            max: 24,
            default: 16,
            step: 2
        },
        lineHeight: {
            min: 1.2,
            max: 2.0,
            default: 1.6,
            step: 0.1
        },
        maxWidth: {
            min: 600,
            max: 1200,
            default: 800,
            step: 50
        }
    };

    // Initialize reading enhancements
    document.addEventListener('DOMContentLoaded', function() {
        initializeReadingEnhancements();
    });

    function initializeReadingEnhancements() {
        setupReadingMode();
        setupFontControls();
        setupReadingProgress();
        setupTableOfContents();
        setupPrintOptimization();
        setupReadingTimeEstimate();
        setupContentHighlighter();
        setupReadingBookmarks();
        setupDarkMode();
    }

    /**
     * Reading Mode - Distraction-free reading
     */
    function setupReadingMode() {
        // Create reading mode button
        const readingModeBtn = document.createElement('button');
        readingModeBtn.className = 'reading-mode-btn';
        readingModeBtn.innerHTML = '📖 Reading Mode';
        readingModeBtn.setAttribute('aria-label', 'Toggle reading mode');
        
        // Add to navigation
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.appendChild(readingModeBtn);
        }

        // Reading mode functionality
        let isReadingMode = false;
        readingModeBtn.addEventListener('click', function() {
            isReadingMode = !isReadingMode;
            document.body.classList.toggle('reading-mode', isReadingMode);
            this.innerHTML = isReadingMode ? '📖 Exit Reading' : '📖 Reading Mode';
            
            if (isReadingMode) {
                // Store scroll position
                window.readingModeScrollPos = window.pageYOffset;
                // Focus on main content
                const mainContent = document.querySelector('#main-content');
                if (mainContent) mainContent.focus();
            } else {
                // Restore scroll position
                if (window.readingModeScrollPos) {
                    window.scrollTo(0, window.readingModeScrollPos);
                }
            }
        });
    }

    /**
     * Font and Typography Controls
     */
    function setupFontControls() {
        // Create font control panel
        const fontPanel = document.createElement('div');
        fontPanel.className = 'font-controls';
        fontPanel.innerHTML = `
            <div class="font-control-group">
                <label for="font-size">Font Size:</label>
                <input type="range" id="font-size" min="${READING_CONFIG.fontSize.min}" 
                       max="${READING_CONFIG.fontSize.max}" value="${READING_CONFIG.fontSize.default}">
                <span class="font-size-value">${READING_CONFIG.fontSize.default}px</span>
            </div>
            <div class="font-control-group">
                <label for="line-height">Line Height:</label>
                <input type="range" id="line-height" min="${READING_CONFIG.lineHeight.min * 10}" 
                       max="${READING_CONFIG.lineHeight.max * 10}" value="${READING_CONFIG.lineHeight.default * 10}">
                <span class="line-height-value">${READING_CONFIG.lineHeight.default}</span>
            </div>
            <div class="font-control-group">
                <label for="max-width">Max Width:</label>
                <input type="range" id="max-width" min="${READING_CONFIG.maxWidth.min}" 
                       max="${READING_CONFIG.maxWidth.max}" value="${READING_CONFIG.maxWidth.default}">
                <span class="max-width-value">${READING_CONFIG.maxWidth.default}px</span>
            </div>
            <button id="reset-fonts" class="reset-btn">Reset</button>
        `;

        // Add to page
        document.body.appendChild(fontPanel);

        // Font size control
        const fontSizeSlider = document.getElementById('font-size');
        const fontSizeValue = document.querySelector('.font-size-value');
        fontSizeSlider.addEventListener('input', function() {
            const size = this.value;
            document.documentElement.style.setProperty('--reading-font-size', size + 'px');
            fontSizeValue.textContent = size + 'px';
            localStorage.setItem('bibletexts-font-size', size);
        });

        // Line height control
        const lineHeightSlider = document.getElementById('line-height');
        const lineHeightValue = document.querySelector('.line-height-value');
        lineHeightSlider.addEventListener('input', function() {
            const height = this.value / 10;
            document.documentElement.style.setProperty('--reading-line-height', height);
            lineHeightValue.textContent = height.toFixed(1);
            localStorage.setItem('bibletexts-line-height', height);
        });

        // Max width control
        const maxWidthSlider = document.getElementById('max-width');
        const maxWidthValue = document.querySelector('.max-width-value');
        maxWidthSlider.addEventListener('input', function() {
            const width = this.value;
            document.documentElement.style.setProperty('--reading-max-width', width + 'px');
            maxWidthValue.textContent = width + 'px';
            localStorage.setItem('bibletexts-max-width', width);
        });

        // Reset button
        document.getElementById('reset-fonts').addEventListener('click', function() {
            resetFontSettings();
        });

        // Load saved settings
        loadFontSettings();
    }

    function loadFontSettings() {
        const fontSize = localStorage.getItem('bibletexts-font-size');
        const lineHeight = localStorage.getItem('bibletexts-line-height');
        const maxWidth = localStorage.getItem('bibletexts-max-width');

        if (fontSize) {
            document.getElementById('font-size').value = fontSize;
            document.documentElement.style.setProperty('--reading-font-size', fontSize + 'px');
            document.querySelector('.font-size-value').textContent = fontSize + 'px';
        }

        if (lineHeight) {
            document.getElementById('line-height').value = lineHeight * 10;
            document.documentElement.style.setProperty('--reading-line-height', lineHeight);
            document.querySelector('.line-height-value').textContent = lineHeight;
        }

        if (maxWidth) {
            document.getElementById('max-width').value = maxWidth;
            document.documentElement.style.setProperty('--reading-max-width', maxWidth + 'px');
            document.querySelector('.max-width-value').textContent = maxWidth + 'px';
        }
    }

    function resetFontSettings() {
        localStorage.removeItem('bibletexts-font-size');
        localStorage.removeItem('bibletexts-line-height');
        localStorage.removeItem('bibletexts-max-width');
        
        document.documentElement.style.removeProperty('--reading-font-size');
        document.documentElement.style.removeProperty('--reading-line-height');
        document.documentElement.style.removeProperty('--reading-max-width');
        
        document.getElementById('font-size').value = READING_CONFIG.fontSize.default;
        document.getElementById('line-height').value = READING_CONFIG.lineHeight.default * 10;
        document.getElementById('max-width').value = READING_CONFIG.maxWidth.default;
        
        document.querySelector('.font-size-value').textContent = READING_CONFIG.fontSize.default + 'px';
        document.querySelector('.line-height-value').textContent = READING_CONFIG.lineHeight.default;
        document.querySelector('.max-width-value').textContent = READING_CONFIG.maxWidth.default + 'px';
    }

    /**
     * Reading Progress Indicator
     */
    function setupReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
        document.body.appendChild(progressBar);

        function updateProgress() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            
            const progressFill = document.querySelector('.reading-progress-fill');
            if (progressFill) {
                progressFill.style.width = scrolled + '%';
            }
        }

        window.addEventListener('scroll', updateProgress);
        updateProgress();
    }

    /**
     * Table of Contents Generator
     */
    function setupTableOfContents() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length < 2) return;

        const toc = document.createElement('div');
        toc.className = 'table-of-contents';
        toc.innerHTML = '<h3>Table of Contents</h3><ul class="toc-list"></ul>';

        const tocList = toc.querySelector('.toc-list');
        
        headings.forEach((heading, index) => {
            // Add ID if not present
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }

            // Create TOC item
            const li = document.createElement('li');
            li.className = `toc-level-${heading.tagName.toLowerCase()}`;
            
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent.trim();
            link.className = 'toc-link';
            
            li.appendChild(link);
            tocList.appendChild(li);
        });

        // Add TOC to page
        const mainContent = document.querySelector('#main-content');
        if (mainContent) {
            mainContent.insertBefore(toc, mainContent.firstChild);
        }
    }

    /**
     * Reading Time Estimate
     */
    function setupReadingTimeEstimate() {
        const content = document.querySelector('#main-content');
        if (!content) return;

        const text = content.textContent;
        const wordsPerMinute = 200;
        const wordCount = text.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);

        const timeEstimate = document.createElement('div');
        timeEstimate.className = 'reading-time';
        timeEstimate.innerHTML = `
            <span class="reading-time-icon">⏱️</span>
            <span class="reading-time-text">${readingTime} min read</span>
        `;

        // Add to header or navigation
        const header = document.querySelector('.site-header');
        if (header) {
            header.appendChild(timeEstimate);
        }
    }

    /**
     * Content Highlighter
     */
    function setupContentHighlighter() {
        let selectedText = '';
        
        document.addEventListener('mouseup', function() {
            selectedText = window.getSelection().toString().trim();
            
            if (selectedText.length > 0) {
                showHighlightOptions(selectedText);
            }
        });

        function showHighlightOptions(text) {
            // Remove existing highlight menu
            const existingMenu = document.querySelector('.highlight-menu');
            if (existingMenu) existingMenu.remove();

            const menu = document.createElement('div');
            menu.className = 'highlight-menu';
            menu.innerHTML = `
                <button class="highlight-btn" data-action="highlight">Highlight</button>
                <button class="highlight-btn" data-action="note">Add Note</button>
                <button class="highlight-btn" data-action="share">Share</button>
            `;

            // Position menu near selection
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                menu.style.position = 'absolute';
                menu.style.top = (rect.top - 40) + 'px';
                menu.style.left = rect.left + 'px';
                menu.style.zIndex = '1000';
            }

            document.body.appendChild(menu);

            // Handle menu actions
            menu.addEventListener('click', function(e) {
                const action = e.target.dataset.action;
                handleHighlightAction(action, text);
                menu.remove();
            });

            // Remove menu when clicking elsewhere
            setTimeout(() => {
                document.addEventListener('click', function removeMenu() {
                    menu.remove();
                    document.removeEventListener('click', removeMenu);
                });
            }, 100);
        }

        function handleHighlightAction(action, text) {
            switch (action) {
                case 'highlight':
                    highlightText(text);
                    break;
                case 'note':
                    addNote(text);
                    break;
                case 'share':
                    shareText(text);
                    break;
            }
        }

        function highlightText(text) {
            // Simple highlighting implementation
            const content = document.querySelector('#main-content');
            if (content) {
                content.innerHTML = content.innerHTML.replace(
                    new RegExp(text, 'gi'),
                    `<mark class="user-highlight">${text}</mark>`
                );
            }
        }

        function addNote(text) {
            const note = prompt('Add a note for: "' + text + '"');
            if (note) {
                // Store note (could be enhanced with localStorage)
                console.log('Note added:', { text, note });
            }
        }

        function shareText(text) {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    text: text,
                    url: window.location.href
                });
            } else {
                // Fallback to clipboard
                navigator.clipboard.writeText(text).then(() => {
                    alert('Text copied to clipboard!');
                });
            }
        }
    }

    /**
     * Reading Bookmarks
     */
    function setupReadingBookmarks() {
        const bookmarkBtn = document.createElement('button');
        bookmarkBtn.className = 'bookmark-btn';
        bookmarkBtn.innerHTML = '🔖 Bookmark';
        bookmarkBtn.setAttribute('aria-label', 'Bookmark this page');

        // Add to navigation
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.appendChild(bookmarkBtn);
        }

        // Check if page is bookmarked
        const bookmarks = JSON.parse(localStorage.getItem('bibletexts-bookmarks') || '[]');
        const currentUrl = window.location.pathname;
        const isBookmarked = bookmarks.includes(currentUrl);

        if (isBookmarked) {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.innerHTML = '🔖 Bookmarked';
        }

        bookmarkBtn.addEventListener('click', function() {
            const bookmarks = JSON.parse(localStorage.getItem('bibletexts-bookmarks') || '[]');
            const currentUrl = window.location.pathname;
            
            if (bookmarks.includes(currentUrl)) {
                // Remove bookmark
                const index = bookmarks.indexOf(currentUrl);
                bookmarks.splice(index, 1);
                this.classList.remove('bookmarked');
                this.innerHTML = '🔖 Bookmark';
            } else {
                // Add bookmark
                bookmarks.push(currentUrl);
                this.classList.add('bookmarked');
                this.innerHTML = '🔖 Bookmarked';
            }
            
            localStorage.setItem('bibletexts-bookmarks', JSON.stringify(bookmarks));
        });
    }

    /**
     * Dark Mode Toggle
     */
    function setupDarkMode() {
        const darkModeBtn = document.createElement('button');
        darkModeBtn.className = 'dark-mode-btn';
        darkModeBtn.innerHTML = '🌙 Dark Mode';
        darkModeBtn.setAttribute('aria-label', 'Toggle dark mode');

        // Add to navigation
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            navContainer.appendChild(darkModeBtn);
        }

        // Check for saved preference
        const isDarkMode = localStorage.getItem('bibletexts-dark-mode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeBtn.innerHTML = '☀️ Light Mode';
        }

        darkModeBtn.addEventListener('click', function() {
            const isDark = document.body.classList.toggle('dark-mode');
            this.innerHTML = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
            localStorage.setItem('bibletexts-dark-mode', isDark);
        });
    }

    /**
     * Print Optimization
     */
    function setupPrintOptimization() {
        // Add print styles
        const printStyles = document.createElement('style');
        printStyles.textContent = `
            @media print {
                .font-controls,
                .reading-progress,
                .highlight-menu,
                .table-of-contents {
                    display: none !important;
                }
                
                .reading-mode {
                    font-size: 12pt !important;
                    line-height: 1.5 !important;
                    max-width: none !important;
                }
                
                .user-highlight {
                    background: none !important;
                    border-bottom: 2px solid #000 !important;
                }
            }
        `;
        document.head.appendChild(printStyles);
    }

    // Export functions for external use
    window.BibleTextsReading = {
        toggleReadingMode: () => document.querySelector('.reading-mode-btn')?.click(),
        toggleDarkMode: () => document.querySelector('.dark-mode-btn')?.click(),
        resetFonts: resetFontSettings
    };

})();

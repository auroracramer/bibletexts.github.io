/**
 * Modern Search Functionality for BibleTexts.com
 * Provides client-side search across all pages with modern UX
 */

(function() {
    'use strict';

    // Search configuration
    const SEARCH_CONFIG = {
        minQueryLength: 2,
        maxResults: 50,
        highlightClass: 'search-highlight',
        debounceDelay: 300
    };

    // Search index
    let searchIndex = [];
    let searchResults = [];

    // Initialize search when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeSearch();
    });

    function initializeSearch() {
        // Build search index
        buildSearchIndex();
        
        // Create search UI
        createSearchInterface();
        
        // Add keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Add search to navigation
        addSearchToNavigation();
    }

    function buildSearchIndex() {
        // Use embedded search index if available
        if (typeof window.BibleTextsSearchIndex !== 'undefined') {
            searchIndex = window.BibleTextsSearchIndex;
            return;
        }
        
        // Fallback: build from current page and navigation
        const currentPage = {
            title: document.title,
            url: window.location.pathname,
            content: extractTextContent(document.body),
            headings: extractHeadings(document.body),
            keywords: []
        };
        
        searchIndex.push(currentPage);
        
        // Add other pages from navigation links
        const navLinks = document.querySelectorAll('.nav-link, a[href$=".html"], a[href$=".htm"]');
        navLinks.forEach(link => {
            if (link.href && !link.href.includes('#')) {
                const pageData = {
                    title: link.textContent.trim(),
                    url: link.href,
                    content: '', // Would be populated from actual page content
                    headings: [],
                    keywords: []
                };
                searchIndex.push(pageData);
            }
        });
    }

    function extractTextContent(element) {
        // Extract clean text content, excluding script and style tags
        const clone = element.cloneNode(true);
        const scripts = clone.querySelectorAll('script, style');
        scripts.forEach(script => script.remove());
        return clone.textContent.replace(/\s+/g, ' ').trim();
    }

    function extractHeadings(element) {
        const headings = [];
        const headingElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headingElements.forEach(heading => {
            headings.push({
                level: parseInt(heading.tagName.charAt(1)),
                text: heading.textContent.trim(),
                id: heading.id || ''
            });
        });
        return headings;
    }

    function createSearchInterface() {
        // Create search container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-overlay" id="search-overlay">
                <div class="search-modal">
                    <div class="search-header">
                        <input type="text" id="search-input" placeholder="Search BibleTexts.com..." autocomplete="off">
                        <button id="search-close" aria-label="Close search">×</button>
                    </div>
                    <div class="search-results" id="search-results">
                        <div class="search-suggestions">
                            <h3>Quick Links</h3>
                            <div class="suggestion-links">
                                <a href="bt.html">Bible Commentary</a>
                                <a href="topical.html">Topical Index</a>
                                <a href="qa.html">Q&A</a>
                                <a href="bibliogr.html">Bibliography</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(searchContainer);

        // Add search styles
        addSearchStyles();

        // Setup event listeners
        setupSearchEvents();
    }

    function addSearchStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .search-container {
                position: relative;
            }

            .search-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: none;
                backdrop-filter: blur(4px);
            }

            .search-overlay.active {
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 10vh;
            }

            .search-modal {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow: hidden;
                animation: searchSlideIn 0.3s ease-out;
            }

            @keyframes searchSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .search-header {
                display: flex;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid #e2e8f0;
                background: #f8fafc;
            }

            #search-input {
                flex: 1;
                border: none;
                outline: none;
                font-size: 1.1rem;
                padding: 0.5rem;
                background: transparent;
            }

            #search-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                color: #64748b;
                border-radius: 4px;
                transition: background-color 0.2s;
            }

            #search-close:hover {
                background: #e2e8f0;
            }

            .search-results {
                max-height: 60vh;
                overflow-y: auto;
            }

            .search-suggestions {
                padding: 1.5rem;
            }

            .search-suggestions h3 {
                margin-bottom: 1rem;
                color: #1e40af;
                font-size: 1.1rem;
            }

            .suggestion-links {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 0.5rem;
            }

            .suggestion-links a {
                display: block;
                padding: 0.75rem 1rem;
                background: #f1f5f9;
                color: #1e40af;
                text-decoration: none;
                border-radius: 6px;
                transition: all 0.2s;
                border: 1px solid transparent;
            }

            .suggestion-links a:hover {
                background: #dbeafe;
                border-color: #3b82f6;
                transform: translateY(-1px);
            }

            .search-result-item {
                padding: 1rem 1.5rem;
                border-bottom: 1px solid #f1f5f9;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            .search-result-item:hover {
                background: #f8fafc;
            }

            .search-result-title {
                font-weight: 600;
                color: #1e40af;
                margin-bottom: 0.25rem;
            }

            .search-result-url {
                font-size: 0.9rem;
                color: #64748b;
                margin-bottom: 0.5rem;
            }

            .search-result-snippet {
                color: #475569;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .search-highlight {
                background: #fef3c7;
                padding: 0.1rem 0.2rem;
                border-radius: 3px;
                font-weight: 600;
            }

            .search-no-results {
                padding: 2rem;
                text-align: center;
                color: #64748b;
            }

            .search-loading {
                padding: 2rem;
                text-align: center;
                color: #64748b;
            }

            .search-stats {
                padding: 0.5rem 1.5rem;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
                font-size: 0.9rem;
                color: #64748b;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .search-modal {
                    width: 95%;
                    margin: 1rem;
                }
                
                .suggestion-links {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    function setupSearchEvents() {
        const searchInput = document.getElementById('search-input');
        const searchOverlay = document.getElementById('search-overlay');
        const searchClose = document.getElementById('search-close');
        const searchResults = document.getElementById('search-results');

        // Open search
        function openSearch() {
            searchOverlay.classList.add('active');
            searchInput.focus();
            document.body.style.overflow = 'hidden';
        }

        // Close search
        function closeSearch() {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
            searchResults.innerHTML = getDefaultResults();
            document.body.style.overflow = '';
        }

        // Search input handler
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < SEARCH_CONFIG.minQueryLength) {
                searchResults.innerHTML = getDefaultResults();
                return;
            }

            searchResults.innerHTML = '<div class="search-loading">Searching...</div>';
            
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, SEARCH_CONFIG.debounceDelay);
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeSearch();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const firstResult = searchResults.querySelector('.search-result-item');
                if (firstResult) firstResult.focus();
            }
        });

        // Close button
        searchClose.addEventListener('click', closeSearch);

        // Overlay click to close
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });

        // Store functions globally for keyboard shortcuts
        window.openSearch = openSearch;
        window.closeSearch = closeSearch;
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                window.openSearch();
            }
            
            // Escape to close search
            if (e.key === 'Escape') {
                window.closeSearch();
            }
        });
    }

    function addSearchToNavigation() {
        // Add search button to navigation
        const navContainer = document.querySelector('.nav-container');
        if (navContainer) {
            const searchButton = document.createElement('button');
            searchButton.className = 'nav-link search-button';
            searchButton.innerHTML = '🔍 Search';
            searchButton.setAttribute('aria-label', 'Open search');
            searchButton.addEventListener('click', window.openSearch);
            navContainer.appendChild(searchButton);
        }
    }

    function performSearch(query) {
        let results;
        
        // Use enhanced search if available
        if (typeof window.BibleTextsSearch !== 'undefined' && window.BibleTextsSearch.performSearch) {
            results = window.BibleTextsSearch.performSearch(query);
        } else {
            // Fallback search
            results = searchIndex.filter(item => {
                const searchText = `${item.title} ${item.content} ${item.keywords ? item.keywords.join(' ') : ''}`.toLowerCase();
                return searchText.includes(query.toLowerCase());
            });
        }

        searchResults.innerHTML = '';
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <h3>No results found</h3>
                    <p>Try different keywords or check the quick links below.</p>
                </div>
                ${getDefaultResults()}
            `;
            return;
        }

        // Limit results
        const limitedResults = results.slice(0, SEARCH_CONFIG.maxResults);
        
        limitedResults.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            
            // Use enhanced highlighting if available
            const title = window.BibleTextsSearch && window.BibleTextsSearch.highlightText 
                ? window.BibleTextsSearch.highlightText(result.title, query)
                : highlightText(result.title, query);
            
            const snippet = window.BibleTextsSearch && window.BibleTextsSearch.getSnippet
                ? window.BibleTextsSearch.getSnippet(result.content, query)
                : getSnippet(result.content, query);
            
            resultElement.innerHTML = `
                <div class="search-result-title">${title}</div>
                <div class="search-result-url">${result.url}</div>
                <div class="search-result-snippet">${snippet}</div>
            `;
            
            resultElement.addEventListener('click', function() {
                window.location.href = result.url;
            });
            
            resultElement.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = result.url;
                }
            });
            
            resultElement.setAttribute('tabindex', '0');
            resultElement.setAttribute('role', 'button');
            
            searchResults.appendChild(resultElement);
        });

        // Add stats
        const stats = document.createElement('div');
        stats.className = 'search-stats';
        stats.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;
        searchResults.appendChild(stats);
    }

    function getDefaultResults() {
        return `
            <div class="search-suggestions">
                <h3>Quick Links</h3>
                <div class="suggestion-links">
                    <a href="bt.html">Bible Commentary</a>
                    <a href="topical.html">Topical Index</a>
                    <a href="qa.html">Q&A</a>
                    <a href="bibliogr.html">Bibliography</a>
                </div>
            </div>
        `;
    }

    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    function getSnippet(content, query, maxLength = 150) {
        if (!content) return '';
        
        const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
        if (queryIndex === -1) {
            return content.substring(0, maxLength) + '...';
        }
        
        const start = Math.max(0, queryIndex - 50);
        const end = Math.min(content.length, start + maxLength);
        let snippet = content.substring(start, end);
        
        if (start > 0) snippet = '...' + snippet;
        if (end < content.length) snippet = snippet + '...';
        
        return highlightText(snippet, query);
    }

    // Advanced search features
    function setupAdvancedSearch() {
        // Add search filters
        const filterContainer = document.createElement('div');
        filterContainer.className = 'search-filters';
        filterContainer.innerHTML = `
            <div class="filter-group">
                <label>
                    <input type="checkbox" id="filter-commentary" checked>
                    Bible Commentary
                </label>
                <label>
                    <input type="checkbox" id="filter-topical" checked>
                    Topical Index
                </label>
                <label>
                    <input type="checkbox" id="filter-qa" checked>
                    Q&A
                </label>
            </div>
        `;
        
        // Add to search modal
        const searchModal = document.querySelector('.search-modal');
        if (searchModal) {
            searchModal.insertBefore(filterContainer, document.getElementById('search-results'));
        }
    }

    // Export functions for external use
    window.BibleTextsSearch = {
        openSearch: () => window.openSearch(),
        closeSearch: () => window.closeSearch(),
        performSearch: performSearch,
        buildIndex: buildSearchIndex
    };

})();

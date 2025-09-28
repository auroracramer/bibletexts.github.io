/**
 * Modern Features and Accessibility Enhancements for BibleTexts.com
 * Provides enhanced user experience, accessibility, and modern web features
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeModernFeatures();
    });

    function initializeModernFeatures() {
        // Initialize all features
        setupSkipNavigation();
        setupResponsiveNavigation();
        setupSearchEnhancement();
        setupAccessibilityFeatures();
        setupSmoothScrolling();
        setupExternalLinkHandling();
        setupTableEnhancements();
        setupKeyboardNavigation();
        setupFocusManagement();
        setupPrintOptimization();
        setupPerformanceOptimizations();
        setupModernSearch();
    }

    /**
     * Skip Navigation for Screen Readers
     */
    function setupSkipNavigation() {
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    /**
     * Responsive Navigation
     */
    function setupResponsiveNavigation() {
        const nav = document.querySelector('.main-nav');
        if (!nav) return;

        // Create mobile menu button
        const menuButton = document.createElement('button');
        menuButton.setAttribute('aria-label', 'Toggle navigation menu');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.className = 'mobile-menu-button';
        menuButton.innerHTML = '☰ Menu';
        
        // Add click handler
        menuButton.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !expanded);
            nav.classList.toggle('nav-open');
        });

        // Insert button before nav
        nav.parentNode.insertBefore(menuButton, nav);

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !menuButton.contains(e.target)) {
                nav.classList.remove('nav-open');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /**
     * Enhanced Search Functionality
     */
    function setupSearchEnhancement() {
        // Add search functionality to existing search links
        const searchLinks = document.querySelectorAll('.search-link');
        searchLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Add visual feedback
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchSection = document.querySelector('.search-section');
                if (searchSection) {
                    searchSection.scrollIntoView({ behavior: 'smooth' });
                    searchSection.focus();
                }
            }
        });
    }

    /**
     * Accessibility Features
     */
    function setupAccessibilityFeatures() {
        // Add ARIA labels to interactive elements
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            if (!button.textContent.trim()) {
                button.setAttribute('aria-label', 'Button');
            }
        });

        // Add role attributes to content sections
        const sections = document.querySelectorAll('.content-section, .column, .grid-item');
        sections.forEach(section => {
            if (!section.getAttribute('role')) {
                section.setAttribute('role', 'region');
            }
        });

        // Announce dynamic content changes
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);

        // Store announcer for use by other functions
        window.announcer = announcer;
    }

    /**
     * Smooth Scrolling for Internal Links
     */
    function setupSmoothScrolling() {
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        internalLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, href);
                    
                    // Focus target for keyboard users
                    target.focus();
                }
            });
        });
    }

    /**
     * External Link Handling
     */
    function setupExternalLinkHandling() {
        const externalLinks = document.querySelectorAll('a[href^="http"]');
        externalLinks.forEach(link => {
            // Ensure external links open in new tab
            if (!link.getAttribute('target')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
            
            // Add visual indicator
            if (!link.querySelector('::after')) {
                link.classList.add('external-link');
            }
        });
    }

    /**
     * Table Enhancements
     */
    function setupTableEnhancements() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            // Add responsive wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);

            // Add scroll indicators for wide tables
            if (table.scrollWidth > table.clientWidth) {
                wrapper.classList.add('table-scrollable');
                
                // Add scroll buttons
                const leftButton = document.createElement('button');
                leftButton.innerHTML = '←';
                leftButton.className = 'scroll-button scroll-left';
                leftButton.setAttribute('aria-label', 'Scroll table left');
                
                const rightButton = document.createElement('button');
                rightButton.innerHTML = '→';
                rightButton.className = 'scroll-button scroll-right';
                rightButton.setAttribute('aria-label', 'Scroll table right');
                
                wrapper.appendChild(leftButton);
                wrapper.appendChild(rightButton);
                
                // Add scroll functionality
                leftButton.addEventListener('click', () => {
                    wrapper.scrollLeft -= 100;
                });
                
                rightButton.addEventListener('click', () => {
                    wrapper.scrollLeft += 100;
                });
            }
        });
    }

    /**
     * Enhanced Keyboard Navigation
     */
    function setupKeyboardNavigation() {
        // Add keyboard navigation for grid items
        const gridItems = document.querySelectorAll('.grid-item');
        gridItems.forEach((item, index) => {
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = this.querySelector('a');
                    if (link) {
                        link.click();
                    }
                }
                
                // Arrow key navigation
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = gridItems[index + 1];
                    if (next) next.focus();
                }
                
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = gridItems[index - 1];
                    if (prev) prev.focus();
                }
            });
        });
    }

    /**
     * Focus Management
     */
    function setupFocusManagement() {
        // Track focus for better UX
        let lastFocusedElement = null;
        
        document.addEventListener('focusin', function(e) {
            lastFocusedElement = e.target;
        });
        
        // Restore focus after modal/overlay interactions
        window.restoreFocus = function() {
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        };
    }

    /**
     * Print Optimization
     */
    function setupPrintOptimization() {
        // Add print styles
        const printStyles = document.createElement('style');
        printStyles.textContent = `
            @media print {
                .mobile-menu-button,
                .scroll-button,
                .skip-link {
                    display: none !important;
                }
                
                .content-section,
                .column,
                .grid-item {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                
                h1, h2, h3, h4, h5, h6 {
                    break-after: avoid;
                    page-break-after: avoid;
                }
            }
        `;
        document.head.appendChild(printStyles);
    }

    /**
     * Performance Optimizations
     */
    function setupPerformanceOptimizations() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        }

        // Debounce scroll events
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Handle scroll-based features here
                updateScrollIndicators();
            }, 100);
        });
    }

    /**
     * Update scroll indicators for tables
     */
    function updateScrollIndicators() {
        const scrollableTables = document.querySelectorAll('.table-scrollable');
        scrollableTables.forEach(wrapper => {
            const leftButton = wrapper.querySelector('.scroll-left');
            const rightButton = wrapper.querySelector('.scroll-right');
            
            if (leftButton) {
                leftButton.style.opacity = wrapper.scrollLeft > 0 ? '1' : '0.5';
            }
            
            if (rightButton) {
                const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
                rightButton.style.opacity = wrapper.scrollLeft < maxScroll ? '1' : '0.5';
            }
        });
    }

    /**
     * Utility Functions
     */
    
    // Announce changes to screen readers
    window.announce = function(message) {
        if (window.announcer) {
            window.announcer.textContent = message;
            setTimeout(() => {
                window.announcer.textContent = '';
            }, 1000);
        }
    };

    // Check if user prefers reduced motion
    window.prefersReducedMotion = function() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    // Get user's preferred color scheme
    window.getColorScheme = function() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    // Add loading states
    window.showLoading = function(element) {
        element.classList.add('loading');
        element.setAttribute('aria-busy', 'true');
    };

    window.hideLoading = function(element) {
        element.classList.remove('loading');
        element.removeAttribute('aria-busy');
    };

    /**
     * Modern Search Integration
     */
    function setupModernSearch() {
        // Load search functionality if available
        if (typeof window.BibleTextsSearch !== 'undefined') {
            // Search is already loaded
            return;
        }
        
        // Add search button to navigation if search.js is not loaded
        const navContainer = document.querySelector('.nav-container');
        if (navContainer && !document.querySelector('.search-button')) {
            const searchButton = document.createElement('button');
            searchButton.className = 'nav-link search-button';
            searchButton.innerHTML = '🔍 Search';
            searchButton.setAttribute('aria-label', 'Open search');
            searchButton.addEventListener('click', function() {
                // Fallback search - open browser search
                if (window.find) {
                    const query = prompt('Search BibleTexts.com:');
                    if (query) {
                        window.find(query);
                    }
                }
            });
            navContainer.appendChild(searchButton);
        }
    }

})();

/**
 * Universal Scroll-Based Opacity + Parallax System
 * Creates smooth opacity and transform transitions based on element distance from target zones
 */

(function() {
    'use strict';
    
    let targetElements = [];
    let lowerTarget = 0;
    let upperTarget = 0;
    let headerHeight = 0;
    let availableHeight = 0;
    let isScrolling = false;
    let resizeTimeout = null;
    let prefersReducedMotion = false;
    
    // Configuration constants
    const MIN_OPACITY = 0;        // Minimum opacity at screen edges
    const PARALLAX_DISTANCE = 10;    // Maximum parallax distance in vh
    const FOOTER_THRESHOLD = 96;    // Footer activation threshold in pixels (6em)
    const VIEWPORT_BUFFER = 100;    // Buffer in pixels for smoother transitions
    
    /**
     * Easing functions
     */
    function easeInQuad(t) {
        return t * t;
    }
    
    function easeOutQuad(t) {
        return t * (2 - t);
    }
    
    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    function easeInCubic(t) {
        return t * t * t;
    }
    
    function easeOutCubic(t) {
        return (--t) * t * t + 1;
    }
    
    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    function easeInQuart(t) {
        return t * t * t * t;
    }
    
    function easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }
    
    function easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    }
    
    function easeInSine(t) {
        return 1 - Math.cos(t * Math.PI / 2);
    }
    
    function easeOutSine(t) {
        return Math.sin(t * Math.PI / 2);
    }
    
    function easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }
    
    function easeInExpo(t) {
        return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
    }
    
    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
    
    function easeInOutExpo(t) {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
    }
    
    function easeInCirc(t) {
        return 1 - Math.sqrt(1 - t * t);
    }
    
    function easeOutCirc(t) {
        return Math.sqrt(1 - (--t) * t);
    }
    
    function easeInOutCirc(t) {
        return t < 0.5 
            ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
            : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
    }
    
    /**
     * Initialize the system
     */
    function init() {
        // Check for reduced motion preference
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            console.log('Animations disabled due to user preference for reduced motion');
            return;
        }
        
        // Wait for DOM and header height to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupSystem);
        } else {
            setupSystem();
        }
    }
    
    /**
     * Setup the system
     */
    function setupSystem() {
        // Wait a bit for header height to be calculated
        setTimeout(() => {
            updateTargetElements();
            updateViewportMetrics();
            updateEffects(); // Run immediately to set initial state
            setupEventListeners();
            
            console.log(`Parallax + Opacity system initialized for ${targetElements.length} elements`);
        }, 100);
    }
    
    /**
     * Find and cache target elements
     */
    function updateTargetElements() {
        // Target .entry-content > * and footer
        const entryContent = document.querySelector('.entry-content');
        const footer = document.querySelector('footer');
        
        targetElements = [];
        
        // Add direct children of .entry-content
        if (entryContent) {
            const children = Array.from(entryContent.children);
            targetElements.push(...children);
        }
        
        // Add footer
        if (footer) {
            targetElements.push(footer);
        }
        
        // Fallback: if no .entry-content, target main > *
        if (targetElements.length === 0) {
            const main = document.querySelector('main');
            if (main) {
                const children = Array.from(main.children);
                targetElements.push(...children);
            }
        }
        
        // Add will-change for performance
        targetElements.forEach(element => {
            if (element) {
                element.style.willChange = 'transform, opacity';
            }
        });
        
        console.log('Target elements found:', targetElements.length);
    }
    
    /**
     * Update viewport metrics
     */
    function updateViewportMetrics() {
        // Get header height from CSS custom property
        const headerHeightValue = getComputedStyle(document.documentElement)
            .getPropertyValue('--header-height');
        headerHeight = headerHeightValue ? parseInt(headerHeightValue) : 128;
        
        // Calculate available height and target points
        availableHeight = window.innerHeight - headerHeight;
        upperTarget = headerHeight + (availableHeight * 0.33);  // First third
        lowerTarget = headerHeight + (availableHeight * 0.67);  // Second third
        
        console.log('Viewport metrics:', { headerHeight, availableHeight, lowerTarget, upperTarget });
    }
    
    /**
     * Calculate opacity and transform based on element position relative to target zones
     */
    function calculateEffects(elementRect, isFooter = false) {
        const elementTop = elementRect.top;
        const elementBottom = elementRect.bottom;
        
        // Check if element is in viewport (with buffer)
        const isInViewport = elementBottom > -VIEWPORT_BUFFER*5 && elementTop < window.innerHeight + VIEWPORT_BUFFER*5;
        
        if (!isInViewport) {
            return { opacity: 1, translateY: 0 }; // Default state for off-screen elements
        }
        
        // Special logic for footer
        if (isFooter) {
            const distanceFromBottom = window.innerHeight - elementTop;
            
            if (distanceFromBottom >= FOOTER_THRESHOLD) {
                return { opacity: 1, translateY: 0 };
            } else {
                const normalizedDistance = Math.max(0, (FOOTER_THRESHOLD - distanceFromBottom) / FOOTER_THRESHOLD);
                const opacity = Math.max(MIN_OPACITY, 1 - (normalizedDistance * (1 - MIN_OPACITY)));
                return { opacity, translateY: 0 }; // Footer doesn't get parallax
            }
        }
        
        // Perfect state: element intersects both target zones
        if (elementTop <= upperTarget && elementBottom >= lowerTarget) {
            return { opacity: 1, translateY: 0 };
        }
        
        // Phase 1: Block entering from below (elementTop goes from bottom edge to upperTarget)
        if (elementTop > upperTarget) {
            const screenBottom = window.innerHeight + VIEWPORT_BUFFER; // Extended bottom
            const journeyStart = screenBottom; // Top at bottom of extended screen
            const journeyEnd = upperTarget;    // Top at upper third
            
            // Calculate progress from extended screen bottom to upper target
            const progress = Math.max(0, Math.min(1, (journeyStart - elementTop) / (journeyStart - journeyEnd)));
            const easedProgress = easeOutQuart(progress);
            
            const opacity = Math.max(MIN_OPACITY, MIN_OPACITY + (easedProgress * (1 - MIN_OPACITY))); // MIN_OPACITY → 1.0
            const translateY = PARALLAX_DISTANCE * (1 - easedProgress); // PARALLAX_DISTANCE → 0
            
            return { opacity, translateY };
        }
        
        // Phase 3: Block exiting upward (elementBottom goes from lowerTarget to top edge)
        if (elementBottom < lowerTarget) {
            const screenTop = -VIEWPORT_BUFFER; // Extended top
            const journeyStart = lowerTarget;    // Bottom at lower third
            const journeyEnd = screenTop;       // Bottom at extended screen top
            
            // Calculate progress from lower target to extended screen top
            const progress = Math.max(0, Math.min(1, (journeyStart - elementBottom) / (journeyStart - journeyEnd)));
            const easedProgress = easeOutQuart(progress);
            
            const opacity = Math.max(MIN_OPACITY, 1.0 - (easedProgress * (1 - MIN_OPACITY))); // 1.0 → MIN_OPACITY
            const translateY = -PARALLAX_DISTANCE * easedProgress; // 0 → -PARALLAX_DISTANCE
            
            return { opacity, translateY };
        }
        
        // Fallback: should not reach here if logic is correct
        return { opacity: 1, translateY: 0 };
    }
    
    /**
     * Update effects for all target elements
     */
    function updateEffects() {
        targetElements.forEach(element => {
            if (!element) return;
            
            const rect = element.getBoundingClientRect();
            const isFooter = element.tagName.toLowerCase() === 'footer';
            const effects = calculateEffects(rect, isFooter);
            
            // Apply opacity
            element.style.opacity = effects.opacity;
            
            // Apply transform
            element.style.transform = `translateY(${effects.translateY}vh)`;
            
            // Ensure smooth transitions
            if (!element.style.transition.includes('opacity') || !element.style.transition.includes('transform')) {
                element.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            }
        });
    }
    
    /**
     * Throttled scroll handler
     */
    function handleScroll() {
        if (!isScrolling) {
            requestAnimationFrame(() => {
                updateEffects();
                isScrolling = false;
            });
            isScrolling = true;
        }
    }
    
    /**
     * Debounced resize handler
     */
    function handleResize() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateViewportMetrics();
            updateTargetElements(); // Re-scan in case DOM changed
            updateEffects();
        }, 250);
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Scroll listener (throttled)
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Resize listener (debounced)
        window.addEventListener('resize', handleResize);
        
        // Listen for reduced motion preference changes
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addListener((e) => {
            prefersReducedMotion = e.matches;
            if (prefersReducedMotion) {
                // User just enabled reduce motion - disable animations immediately
                console.log('Reduce motion enabled - disabling animations');
                targetElements.forEach(element => {
                    if (element) {
                        element.style.opacity = '1';
                        element.style.transform = 'none';
                        element.style.transition = 'none';
                        element.style.willChange = 'auto';
                    }
                });
            } else {
                // User disabled reduce motion - re-enable animations
                console.log('Reduce motion disabled - enabling animations');
                setupSystem();
            }
        });
        
        // Re-initialize if new content is loaded dynamically
        if (typeof window.wp !== 'undefined' && window.wp.hooks) {
            window.wp.hooks.addAction('asari.contentLoaded', 'asari/parallax-opacity-system', () => {
                updateTargetElements();
                updateEffects();
            });
        }
    }
    
    /**
     * Cleanup function
     */
    function cleanup() {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        
        // Reset all element styles
        targetElements.forEach(element => {
            if (element) {
                element.style.opacity = '';
                element.style.transform = '';
                element.style.transition = '';
                element.style.willChange = '';
            }
        });
        
        targetElements = [];
    }
    
    /**
     * Public API
     */
    window.asariParallaxOpacity = {
        init: init,
        update: updateEffects,
        cleanup: cleanup,
        setTargets: (elements) => {
            targetElements = elements;
            updateEffects();
        }
    };
    
    // Auto-initialize
    init();
    
})();
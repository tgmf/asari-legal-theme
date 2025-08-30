/**
 * Universal Scroll-Based Opacity System
 * Creates smooth opacity transitions based on element distance from viewport center
 */

(function() {
    'use strict';
    
    let targetElements = [];
    let viewportCenter = 0;
    let headerHeight = 0;
    let isScrolling = false;
    let resizeTimeout = null;
    let prefersReducedMotion = false;
    
    /**
     * Initialize the opacity system
     */
    function init() {
        // Check for reduced motion preference
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            console.log('Opacity animations disabled due to user preference for reduced motion');
            return;
        }
        
        // Wait for DOM and header height to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupOpacitySystem);
        } else {
            setupOpacitySystem();
        }
    }
    
    /**
     * Setup the opacity system
     */
    function setupOpacitySystem() {
        // Wait a bit for header height to be calculated
        setTimeout(() => {
            updateTargetElements();
            updateViewportMetrics();
            updateOpacities(); // Run immediately to set initial state
            setupEventListeners();
            
            console.log(`Opacity system initialized for ${targetElements.length} elements`);
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
        
        // Calculate viewport center (accounting for header)
        viewportCenter = headerHeight + (window.innerHeight - headerHeight) / 2;
    }
    
    /**
     * Calculate opacity based on element position relative to viewport center
     */
    function calculateOpacity(elementRect, isFooter = false) {
        const elementTop = elementRect.top;
        const elementBottom = elementRect.bottom;
        const MIN_OPACITY = 0.2; // Final opacity
        
        // Check if element is in viewport (with some buffer)
        const isInViewport = elementBottom > -100 && elementTop < window.innerHeight + 100;
        
        if (!isInViewport) {
            return 1; // Full opacity for elements outside viewport
        }
        
        // Special logic for footer - gets full opacity when top is close to viewport
        if (isFooter) {
            const footerThreshold = 96; // 6em (assuming 16px base font)
            const distanceFromBottom = window.innerHeight - elementTop;
            
            if (distanceFromBottom >= footerThreshold) {
                return 1; // Full opacity when footer is 6em from bottom
            } else {
                // Fade in as it approaches the threshold
                const fadeRange = footerThreshold;
                const normalizedDistance = Math.max(0, (footerThreshold - distanceFromBottom) / fadeRange);
                return Math.max(0.2, 1 - (normalizedDistance * 0.8));
            }
        }
        
        // Normal logic: Full opacity if ANY part of the block overlaps viewport center
        if (elementTop <= viewportCenter && elementBottom >= viewportCenter) {
            return 1; // Full opacity when block overlaps viewport center
        }
        
        // Calculate distance from closest edge to viewport center
        let distanceFromCenter;
        if (elementBottom < viewportCenter) {
            // Block is above center - measure from bottom edge
            distanceFromCenter = viewportCenter - elementBottom;
        } else {
            // Block is below center - measure from top edge
            distanceFromCenter = elementTop - viewportCenter;
        }
        
        // Maximum fade distance is half the viewport height
        const maxDistance = (window.innerHeight - headerHeight) / 2;
        
        // Linear interpolation: 1.0 at center overlap, 0.2 at maximum distance
        const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);
        const opacity = Math.max(MIN_OPACITY, 1 - (normalizedDistance * (1 - MIN_OPACITY)));
        
        return opacity;
    }
    
    /**
     * Update opacities for all target elements
     */
    function updateOpacities() {
        targetElements.forEach(element => {
            if (!element) return;
            
            const rect = element.getBoundingClientRect();
            const isFooter = element.tagName.toLowerCase() === 'footer';
            const opacity = calculateOpacity(rect, isFooter);
            
            // Apply opacity with smooth transition
            element.style.opacity = opacity;
            
            // Ensure transition is applied
            if (!element.style.transition.includes('opacity')) {
                element.style.transition = element.style.transition 
                    ? `${element.style.transition}, opacity 0.3s ease-out`
                    : 'opacity 0.3s ease-out';
            }
        });
    }
    
    /**
     * Throttled scroll handler
     */
    function handleScroll() {
        if (!isScrolling) {
            requestAnimationFrame(() => {
                updateOpacities();
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
            updateOpacities();
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
                console.log('Reduce motion enabled - disabling opacity animations');
                targetElements.forEach(element => {
                    if (element) {
                        element.style.opacity = '1';
                        element.style.transition = 'none';
                    }
                });
            } else {
                // User disabled reduce motion - re-enable animations
                console.log('Reduce motion disabled - enabling opacity animations');
                setupOpacitySystem();
            }
        });
        
        // Re-initialize if new content is loaded dynamically
        if (typeof window.wp !== 'undefined' && window.wp.hooks) {
            window.wp.hooks.addAction('asari.contentLoaded', 'asari/opacity-system', () => {
                updateTargetElements();
                updateOpacities();
            });
        }
    }
    
    /**
     * Cleanup function
     */
    function cleanup() {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        
        // Reset all element opacities
        targetElements.forEach(element => {
            if (element) {
                element.style.opacity = '';
                element.style.transition = '';
            }
        });
        
        targetElements = [];
    }
    
    /**
     * Public API
     */
    window.asariOpacitySystem = {
        init: init,
        update: updateOpacities,
        cleanup: cleanup,
        setTargets: (elements) => {
            targetElements = elements;
            updateOpacities();
        }
    };
    
    // Auto-initialize
    init();
    
})();
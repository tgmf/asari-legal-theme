/**
 * Hero Block Frontend JavaScript
 */

(function() {
    'use strict';
    
    /**
     * Initialize hero blocks when DOM is ready
     */
    function initHeroBlocks() {
        const heroBlocks = document.querySelectorAll('.wp-block-asari-hero');
        heroBlocks.forEach(setupHeroBlock);
    }
    
    /**
     * Setup individual hero block
     */
    function setupHeroBlock(heroBlock) {
        const bgUrl = heroBlock.getAttribute('data-bg-url');
        const textAlignment = heroBlock.getAttribute('data-text-alignment') || 'center';
        const middleReveal = heroBlock.querySelector('.hero-middle-reveal');
        
        // Set CSS custom properties
        if (bgUrl) {
            heroBlock.style.setProperty('--hero-bg-image', `url('${bgUrl}')`);
            preloadBackgroundImage(bgUrl, () => {
                heroBlock.classList.add('hero-bg-loaded');
            });
        }
        
        heroBlock.style.setProperty('--hero-text-alignment', textAlignment);
        heroBlock.classList.add('hero-loaded');
        console.log(document.body.classList.contains('block-editor-iframe__body'));
        setupScrollAnimation(heroBlock, middleReveal);
    }

    /**
     * Setup scroll animation
     */
    function setupScrollAnimation(heroBlock, middleReveal) {
        // Check if we're in editor environment
        if (document.body.classList.contains('block-editor-iframe__body')) {
            // In editor - don't run scroll animations
            return;
        }
        
        // Animation constants
        const MIN_HEIGHT = 1;    // 1rem starting height
        const MAX_HEIGHT = 17;   // 17rem final height
        const MIN_OPACITY = 0.5; // Final opacity
        const MIN_SCALE = 0.85;   // Final text scale
        
        // Cache DOM elements and calculations
        const textElements = heroBlock.querySelectorAll('.hero-top-text span, .hero-bottom-text span');
        
        function getAnimationConfig() {
            const heroContent = heroBlock.querySelector('.hero-content');
            const headerHeight = parseInt(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--header-height') || '128'
            );
            
            return {
                heroTop: heroBlock.offsetTop,
                headerHeight,
                phase1Duration: heroBlock.offsetHeight - heroContent.offsetHeight,
                phase2Duration: window.innerHeight - headerHeight,
                animationStart: heroBlock.offsetTop - headerHeight
            };
        }

        /**
         * Initialize state for page loads beyond animation range
         */
        function initializeState() {
            const config = getAnimationConfig();
            const scrollFromStart = window.scrollY - config.animationStart;
            const totalDuration = config.phase1Duration + config.phase2Duration;
            
            // Set final state if loaded beyond animation range
            if (scrollFromStart > totalDuration) {
                heroBlock.style.opacity = MIN_OPACITY;
                textElements.forEach(el => el.style.transform = `scale(${MIN_SCALE})`);
                middleReveal.style.height = `${MIN_HEIGHT}rem`;
            } else updateAnimation();
        }
        
        /**
         * Update animation based on scroll position
         */
        function updateAnimation() {
            const config = getAnimationConfig();
            const scrollFromStart = window.scrollY - config.animationStart;
            const totalDuration = config.phase1Duration + config.phase2Duration;
            
            // Early return if outside animation range
            if (scrollFromStart <= 0 || scrollFromStart > totalDuration) {
                return;
            }
            
            if (scrollFromStart <= config.phase1Duration) {
                // Phase 1: Expansion with easing
                const progress = scrollFromStart / config.phase1Duration;
                const easedProgress = easeInQuad(progress);
                const currentHeight = MIN_HEIGHT + (easedProgress * (MAX_HEIGHT - MIN_HEIGHT));
                
                middleReveal.style.height = `${currentHeight}rem`;
                
            } else {
                // Phase 2: Contraction with fade effects (linear)
                const progress = (scrollFromStart - config.phase1Duration) / config.phase2Duration;
                const easedProgress = easeOutQuad(progress);
                // Height: 17rem → 1rem
                const currentHeight = MAX_HEIGHT - (easedProgress * (MAX_HEIGHT - MIN_HEIGHT));
                middleReveal.style.height = `${currentHeight}rem`;
                
                // Opacity: 1 → 0.4
                const currentOpacity = Math.max(MIN_OPACITY, 1 - (easedProgress * (1 - MIN_OPACITY)));
                heroBlock.style.opacity = currentOpacity;
                
                // Text scale: 1 → 0.9
                const currentScale = Math.max(MIN_SCALE, 1 - (easedProgress * (1 - MIN_SCALE)));
                textElements.forEach(el => el.style.transform = `scale(${currentScale})`);
            }
        }
        
        // Initialize state and run initial update
        initializeState();
        
        // Setup throttled scroll listener
        let isScrolling = false;
        
        function onScroll() {
            if (!isScrolling) {
                requestAnimationFrame(() => {
                    updateAnimation();
                    isScrolling = false;
                });
                isScrolling = true;
            }
        }
        
        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Store cleanup function
        heroBlock._scrollCleanup = () => {
            window.removeEventListener('scroll', onScroll);
        };
    }

    function easeOutQuad(t) {
        return t * (2 - t);
    }

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function easeInQuad(t) {
        return t * t;
    }
    
    /**
     * Preload background image with callback
     */
    function preloadBackgroundImage(url, callback) {
        const img = new Image();
        img.onload = img.onerror = callback;
        img.src = url;
    }
    
    /**
     * Handle window resize with debouncing
     */
    function handleResize() {
        const heroBlocks = document.querySelectorAll('.wp-block-asari-hero');
        heroBlocks.forEach(heroBlock => {
            // Force recalculation by triggering reflow
            heroBlock.style.minHeight = heroBlock.style.minHeight;
        });
    }
    
    /**
     * Cleanup scroll listeners (for dynamic content)
     */
    function cleanup() {
        const heroBlocks = document.querySelectorAll('.wp-block-asari-hero');
        heroBlocks.forEach(heroBlock => {
            if (heroBlock._scrollCleanup) {
                heroBlock._scrollCleanup();
                delete heroBlock._scrollCleanup;
            }
        });
    }
    
    /**
     * Initialize everything
     */
    function init() {
        initHeroBlocks();
        
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });
        
        // Re-initialize on dynamic content loading
        if (typeof window.wp !== 'undefined' && window.wp.hooks) {
            window.wp.hooks.addAction('asari.contentLoaded', 'asari/hero', initHeroBlocks);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose API for external use
    window.asariHero = {
        init: initHeroBlocks,
        setupBlock: setupHeroBlock,
        cleanup: cleanup
    };
    
})();
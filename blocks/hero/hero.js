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
        console.log('Initializing hero blocks:', heroBlocks);
        heroBlocks.forEach(function(heroBlock) {
            setupHeroBlock(heroBlock);
        });
    }
    
    /**
     * Setup individual hero block
     */
    function setupHeroBlock(heroBlock) {
        const bgUrl = heroBlock.getAttribute('data-bg-url');
        const textAlignment = heroBlock.getAttribute('data-text-alignment') || 'center';
        const middleReveal = heroBlock.querySelector('.hero-middle-reveal');
        console.log(bgUrl, textAlignment);
        
        // Set CSS custom properties
        if (bgUrl) {
            heroBlock.style.setProperty('--hero-bg-image', `url('${bgUrl}')`);
            preloadBackgroundImage(bgUrl, function() {
                heroBlock.classList.add('hero-bg-loaded');
            });
        }
        
        heroBlock.style.setProperty('--hero-text-alignment', textAlignment);
        
        // Add loaded class for animations
        heroBlock.classList.add('hero-loaded');
        

        if (middleReveal) {
            setupScrollReveal(heroBlock, middleReveal);
        }
        
        // Add intersection observer for scroll animations (optional)
        if ('IntersectionObserver' in window) {
            setupScrollAnimation(heroBlock);
        }
    }

    /**
     * Setup scroll reveal animation for hero block
     */
    function setupScrollReveal(heroBlock, middleReveal) {
        // Animation parameters
        const minHeight = 1; // 1rem starting height
        const maxHeight = 17; // 17rem final height
        
        function getTriggerHeight() {
            const heroContent = heroBlock.querySelector('.hero-content');
            const sectionHeight = heroBlock.offsetHeight;
            const contentHeight = heroContent.offsetHeight;
            return sectionHeight - contentHeight;
        }
        
        function updateReveal() {
            const scrollY = window.scrollY;
            const heroTop = heroBlock.offsetTop;
            const headerHeight = parseInt(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--header-height') || '128'
            );
            const triggerHeight = getTriggerHeight();
            
            // Calculate scroll position relative to when animation should start
            const animationTriggerPoint = heroTop - headerHeight;
            const scrollFromTrigger = scrollY - animationTriggerPoint;
            
            if (scrollFromTrigger >= 0 && scrollFromTrigger <= triggerHeight) {
                // Within animation range - directly calculate height
                const progress = Math.min(scrollFromTrigger / triggerHeight, 1);
                const easedProgress = easeInQuad(progress);
                const currentHeight = minHeight + (easedProgress * (maxHeight - minHeight));
                
                middleReveal.style.height = `${currentHeight}rem`;
            } else if (scrollFromTrigger < 0) {
                // Before animation start
                middleReveal.style.height = `${minHeight}rem`;
            } else {
                // After animation range
                middleReveal.style.height = `${maxHeight}rem`;
            }
        }
        
        // Throttled scroll listener
        let ticking = false;
        
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    updateReveal();
                    ticking = false;
                });
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', onScroll, { passive: true });
        
        heroBlock._scrollCleanup = () => {
            window.removeEventListener('scroll', onScroll);
        };
        
        // Initial call - handles page reload at any position
        updateReveal();
    }

    function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    function easeInQuad(t) {
        return t * t;
    }
    
    /**
     * Preload background image
     */
    function preloadBackgroundImage(url, callback) {
        const img = new Image();
        img.onload = callback;
        img.onerror = callback; // Still call callback on error
        img.src = url;
    }
    
    /**
     * Setup scroll-based animations
     */
    function setupScrollAnimation(heroBlock) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('hero-in-view');
                } else {
                    entry.target.classList.remove('hero-in-view');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        observer.observe(heroBlock);
    }
    
    /**
     * Handle window resize
     */
    function handleResize() {
        // Recalculate hero heights if needed
        const heroBlocks = document.querySelectorAll('.wp-block-asari-hero');
        heroBlocks.forEach(function(heroBlock) {
            // Trigger reflow for percentage-based heights
            heroBlock.style.minHeight = heroBlock.style.minHeight;
        });
    }
    
    /**
     * Initialize everything
     */
    function init() {
        // Initial setup
        initHeroBlocks();
        
        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });
        
        // Re-initialize on dynamic content loading (for AJAX-loaded content)
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
    
    // Expose for potential external use
    window.asariHero = {
        init: initHeroBlocks,
        setupBlock: setupHeroBlock
    };
    
})();
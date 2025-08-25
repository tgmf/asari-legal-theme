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
        console.log(bgUrl, textAlignment);
        
        // Set CSS custom properties
        if (bgUrl) {
            heroBlock.style.setProperty('--hero-bg-image', `url('${bgUrl}')`);
        }
        
        heroBlock.style.setProperty('--hero-text-alignment', textAlignment);
        
        // Add loaded class for animations
        heroBlock.classList.add('hero-loaded');
        
        // Handle background image loading
        if (bgUrl) {
            preloadBackgroundImage(bgUrl, function() {
                heroBlock.classList.add('hero-bg-loaded');
            });
        }
        
        // Add intersection observer for scroll animations (optional)
        if ('IntersectionObserver' in window) {
            setupScrollAnimation(heroBlock);
        }
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
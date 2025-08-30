/**
 * Dynamic Header Height Calculator
 * Calculates and sets header height CSS variable from actual DOM
 */

(function() {
    'use strict';
    
    /**
     * Calculate and set header height
     */
    function setHeaderHeight() {
        const header = document.querySelector('header[class*="wp-block-template-part"], .wp-site-blocks > header, .site-header');
        
        if (!header) {
            // Fallback if no header found
            document.documentElement.style.setProperty('--header-height', '128px');
            return 128;
        }
        
        const blockGap = 0; //getComputedStyle(document.documentElement).getPropertyValue('--wp--style--block-gap').trim();
        const adminBarHeight = document.querySelector('#wpadminbar') ? document.querySelector('#wpadminbar').offsetHeight : 0;
        const headerHeight = blockGap ? header.offsetHeight + parseInt(blockGap.replace('rem', '') * 16, 10) : header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight + adminBarHeight}px`);

        return headerHeight + adminBarHeight;
    }
    
    /**
     * Debounced resize handler
     */
    function handleResize() {
        clearTimeout(handleResize.timeout);
        handleResize.timeout = setTimeout(setHeaderHeight, 100);
    }
    
    /**
     * Initialize header height calculation
     */
    function init() {
        // Initial calculation
        setHeaderHeight();
        
        // Recalculate on resize
        window.addEventListener('resize', handleResize);
        
        // Recalculate when fonts load (can affect header height)
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(setHeaderHeight);
        }
        
        // Recalculate after a delay to ensure all content is loaded
        setTimeout(setHeaderHeight, 500);
        
        // Watch for navigation changes that might affect header height
        const navigation = document.querySelector('.wp-block-navigation');
        if (navigation) {
            const observer = new MutationObserver(setHeaderHeight);
            observer.observe(navigation, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }
    
    /**
     * Expose API for external use
     */
    window.asariHeaderHeight = {
        calculate: setHeaderHeight,
        init: init
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
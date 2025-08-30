/**
 * Image With Options Block Frontend JavaScript
 */

(function() {
    'use strict';
    
    /**
     * Initialize image with options blocks when DOM is ready
     */
    function initImageWithOptionsBlocks() {
        const imageWithOptionsBlocks = document.querySelectorAll('.wp-block-asari-image-with-options');
        imageWithOptionsBlocks.forEach(setupImageWithOptionsBlock);
    }
    
    /**
     * Setup individual image with options block
     */
    function setupImageWithOptionsBlock(block) {
        const accordion = block.querySelector('.image-with-options-accordion');
        if (accordion) {
            setupAccordion(accordion);
        }
        
        // Setup parallax effect for the image
        const imageElement = block.querySelector('.image-with-options-image');
        if (imageElement) {
            setupParallaxEffect(block, imageElement);
        }
        
        // Add loaded class for animations
        block.classList.add('image-with-options-loaded');
    }
    
    /**
     * Setup aggressive parallax effect for the image
     */
    function setupParallaxEffect(block, imageElement) {
        // Check if we're in editor environment
        if (document.body.classList.contains('block-editor-iframe__body')) {
            // In editor - don't run parallax animations
            return;
        }
        
        function updateParallax() {
            const headerHeight = parseInt(
                getComputedStyle(document.documentElement)
                    .getPropertyValue('--header-height') || '128'
            );
            
            const blockRect = block.getBoundingClientRect();
            const blockTop = blockRect.top;
            const windowHeight = window.innerHeight;
            const triggerPoint = windowHeight / 1.5;
            
            // End point: when block top touches header
            const endPoint = headerHeight;
            
            // Calculate progress from trigger to end point
            const totalDistance = triggerPoint - endPoint;
            const currentDistance = blockTop - endPoint;
            const progress = Math.max(0, Math.min(1, 1 - (currentDistance / totalDistance)));
            
            if (blockTop > triggerPoint) {
                // Before trigger: image is below screen
                const belowOffset = windowHeight * 0.33; // Start 33% of screen height below
                imageElement.style.transform = `translateY(${belowOffset}px)`;
                
            } else if (blockTop > endPoint) {
                // Between trigger and end: aggressive catch-up with easing
                const easedProgress = easeOutQuad(progress);
                const belowOffset = windowHeight * 0.33;
                const currentOffset = belowOffset * (1 - easedProgress);
                imageElement.style.transform = `translateY(${currentOffset}px)`;
                
            } else {
                // After end point: move together with block (no transform)
                imageElement.style.transform = 'translateY(0)';
            }
        }
        
        // Throttled scroll listener
        let isScrolling = false;
        
        function onScroll() {
            if (!isScrolling) {
                requestAnimationFrame(() => {
                    updateParallax();
                    isScrolling = false;
                });
                isScrolling = true;
            }
        }
        
        // Initial update
        updateParallax();
        
        // Setup scroll listener
        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Store cleanup function and update function
        block._parallaxCleanup = () => {
            window.removeEventListener('scroll', onScroll);
        };
        block._parallaxUpdate = updateParallax;
    }
    
    /**
     * Easing function for smooth catch-up effect
     */
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
     * Setup accordion functionality
     */
    function setupAccordion(accordion) {
        const tabs = accordion.querySelectorAll('.accordion-tab');
        const panels = accordion.querySelectorAll('.accordion-panel');
        
        if (tabs.length === 0 || panels.length === 0) return;
        
        // Add event listeners to tabs
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => switchTab(tabs, panels, index));
            
            // Keyboard navigation
            tab.addEventListener('keydown', (e) => {
                handleKeyboardNavigation(e, tabs, panels, index);
            });
        });
        
        // Ensure first tab is active on load
        // if (!accordion.querySelector('.accordion-tab.active')) {
        //     switchTab(tabs, panels, 0);
        // }
    }
    
    /**
     * Switch active tab
     */
    function switchTab(tabs, panels, activeIndex) {
        // Remove active states
        tabs.forEach((tab, index) => {
            tab.classList.toggle('active', index === activeIndex);
            tab.setAttribute('aria-selected', index === activeIndex);
        });
        
        panels.forEach((panel, index) => {
            panel.classList.toggle('active', index === activeIndex);
            panel.setAttribute('aria-hidden', index !== activeIndex);
        });
        
        // Focus management for accessibility
        tabs[activeIndex].focus();
    }
    
    /**
     * Handle keyboard navigation for tabs
     */
    function handleKeyboardNavigation(event, tabs, panels, currentIndex) {
        let newIndex = currentIndex;
        
        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                newIndex = (currentIndex + 1) % tabs.length;
                break;
                
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
                break;
                
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
                
            case 'End':
                event.preventDefault();
                newIndex = tabs.length - 1;
                break;
                
            case 'Enter':
            case ' ':
                event.preventDefault();
                switchTab(tabs, panels, currentIndex);
                return;
                
            default:
                return;
        }
        
        switchTab(tabs, panels, newIndex);
    }
    
    /**
     * Handle window resize
     */
    function handleResize() {
        // Recalculate any dynamic heights if needed
        const accordionContents = document.querySelectorAll('.accordion-content');
        accordionContents.forEach(content => {
            const activePanel = content.querySelector('.accordion-panel.active');
            if (activePanel) {
                // Force reflow for proper height calculation
                content.style.minHeight = activePanel.offsetHeight + 'px';
            }
        });
        
        // Re-run parallax calculations on resize
        const imageWithOptionsBlocks = document.querySelectorAll('.wp-block-asari-image-with-options');
        imageWithOptionsBlocks.forEach(block => {
            const imageElement = block.querySelector('.image-with-options-image');
            if (imageElement && block._parallaxUpdate) {
                block._parallaxUpdate();
            }
        });
    }
    
    /**
     * Cleanup function
     */
    function cleanup() {
        const imageWithOptionsBlocks = document.querySelectorAll('.wp-block-asari-image-with-options');
        imageWithOptionsBlocks.forEach(block => {
            // Clean up accordion listeners
            const tabs = block.querySelectorAll('.accordion-tab');
            tabs.forEach(tab => {
                tab.replaceWith(tab.cloneNode(true));
            });
            
            // Clean up parallax listeners
            if (block._parallaxCleanup) {
                block._parallaxCleanup();
                delete block._parallaxCleanup;
            }
            if (block._parallaxUpdate) {
                delete block._parallaxUpdate;
            }
        });
    }
    
    /**
     * Initialize everything
     */
    function init() {
        initImageWithOptionsBlocks();
        
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });
        
        // Re-initialize on dynamic content loading
        if (typeof window.wp !== 'undefined' && window.wp.hooks) {
            window.wp.hooks.addAction('asari.contentLoaded', 'asari/image-with-options', initImageWithOptionsBlocks);
        }
        
        // Initial resize calculation
        setTimeout(handleResize, 100);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose API for external use
    window.asariImageWithOptions = {
        init: initImageWithOptionsBlocks,
        setupBlock: setupImageWithOptionsBlock,
        cleanup: cleanup
    };
    
})();
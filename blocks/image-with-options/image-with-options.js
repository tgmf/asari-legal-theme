/**
 * Split Content Block Frontend JavaScript
 */

(function() {
    'use strict';
    
    /**
     * Initialize split content blocks when DOM is ready
     */
    function initSplitContentBlocks() {
        const splitContentBlocks = document.querySelectorAll('.wp-block-asari-image-with-options');
        splitContentBlocks.forEach(setupSplitContentBlock);
    }
    
    /**
     * Setup individual split content block
     */
    function setupSplitContentBlock(block) {
        const accordion = block.querySelector('.image-with-options-accordion');
        if (accordion) {
            setupAccordion(accordion);
        }
        
        // Add loaded class for animations
        block.classList.add('image-with-options-loaded');
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
    }
    
    /**
     * Cleanup function
     */
    function cleanup() {
        const splitContentBlocks = document.querySelectorAll('.wp-block-asari-image-with-options');
        splitContentBlocks.forEach(block => {
            const tabs = block.querySelectorAll('.accordion-tab');
            tabs.forEach(tab => {
                // Remove cloned event listeners (if any cleanup is needed)
                tab.replaceWith(tab.cloneNode(true));
            });
        });
    }
    
    /**
     * Initialize everything
     */
    function init() {
        initSplitContentBlocks();
        
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });
        
        // Re-initialize on dynamic content loading
        if (typeof window.wp !== 'undefined' && window.wp.hooks) {
            window.wp.hooks.addAction('asari.contentLoaded', 'asari/image-with-options', initSplitContentBlocks);
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
    window.asariSplitContent = {
        init: initSplitContentBlocks,
        setupBlock: setupSplitContentBlock,
        cleanup: cleanup
    };
    
})();
/**
 * Practice Grid Block Frontend JavaScript
 */

(function() {
    'use strict';
    
    /**
     * Initialize practice grid blocks when DOM is ready
     */
    function initPracticeGridBlocks() {
        const practiceGridBlocks = document.querySelectorAll('.wp-block-asari-practice-grid');
        practiceGridBlocks.forEach(setupPracticeGridBlock);
    }
    
    /**
     * Setup individual practice grid block
     */
    function setupPracticeGridBlock(block) {
        // Check if we're in editor environment
        if (document.body.classList.contains('block-editor-iframe__body')) {
            // In editor - show all cards immediately
            const practiceCards = block.querySelectorAll('.practice-card');
            practiceCards.forEach(card => card.classList.add('animate'));
            return;
        }
        
        // Setup row-by-row animations
        setupRowAnimations(block);
    }
    
    /**
     * Group cards by rows and animate each row when it enters viewport
     */
    function setupRowAnimations(block) {
        const practiceCards = block.querySelectorAll('.practice-card');
        if (practiceCards.length === 0) return;
        
        // Get current column count and group cards by rows
        const columns = getCurrentColumnCount();
        const rowGroups = {};
        
        practiceCards.forEach((card, index) => {
            const rowIndex = Math.floor(index / columns);
            const positionInRow = index % columns;
            
            // Set staggered delay within each row
            const delay = 0.1 + (positionInRow * 0.05);
            card.style.transitionDelay = `${delay}s`;
            
            // Group by row
            if (!rowGroups[rowIndex]) {
                rowGroups[rowIndex] = [];
            }
            rowGroups[rowIndex].push(card);
        });
        
        // Create intersection observers for each row
        const observers = [];
        
        Object.keys(rowGroups).forEach(rowIndex => {
            const rowCards = rowGroups[rowIndex];
            const firstCardInRow = rowCards[0];
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Animate all cards in this row
                        rowCards.forEach(card => {
                            card.classList.add('animate');
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '0px 0px 20% 0px',
                threshold: 0.1
            });
            
            observer.observe(firstCardInRow);
            observers.push(observer);
        });
        
        // Store cleanup function
        block._cleanup = () => {
            observers.forEach(observer => observer.disconnect());
        };
    }
    
    /**
     * Get current column count based on viewport width
     */
    function getCurrentColumnCount() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 768) return 2;
        if (window.innerWidth <= 1024) return 3;
        return 4;
    }
    
    /**
     * Handle window resize - recalculate delays for new column layout
     */
    function handleResize() {
        const practiceGridBlocks = document.querySelectorAll('.wp-block-asari-practice-grid');
        practiceGridBlocks.forEach(block => {
            const practiceCards = block.querySelectorAll('.practice-card');
            const columns = getCurrentColumnCount();
            
            // Recalculate delays for new column layout
            practiceCards.forEach((card, index) => {
                const positionInRow = index % columns;
                const delay = 0.1 + (positionInRow * 0.05);
                card.style.transitionDelay = `${delay}s`;
            });
        });
    }
    
    /**
     * Cleanup function
     */
    function cleanup() {
        const practiceGridBlocks = document.querySelectorAll('.wp-block-asari-practice-grid');
        practiceGridBlocks.forEach(block => {
            if (block._cleanup) {
                block._cleanup();
                delete block._cleanup;
            }
        });
    }
    
    /**
     * Initialize everything
     */
    function init() {
        initPracticeGridBlocks();
        
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });
        
        // Re-initialize on dynamic content loading
        if (typeof window.wp !== 'undefined' && window.wp.hooks) {
            window.wp.hooks.addAction('asari.contentLoaded', 'asari/practice-grid', initPracticeGridBlocks);
        }
        
        // Initial resize calculation
        setTimeout(handleResize, 100);
    }
    
    /**
     * Initialize when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose API for external use
    window.asariPracticeGrid = {
        init: initPracticeGridBlocks,
        cleanup: cleanup
    };
    
})();
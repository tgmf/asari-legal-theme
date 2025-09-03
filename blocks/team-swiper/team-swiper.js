/**
 * Team Swiper Block Frontend JavaScript
 */

(function() {
    "use strict";
    
    let swiperInstances = new Map();
    
    /**
     * Initialize team swiper blocks when DOM is ready
     */
    function initTeamSwiperBlocks() {
        const teamSwiperBlocks = document.querySelectorAll(".wp-block-asari-team-swiper");
        teamSwiperBlocks.forEach(setupTeamSwiperBlock);
    }
    
    /**
     * Setup individual team swiper block
     */
    function setupTeamSwiperBlock(block) {
        const swiperId = block.getAttribute("data-swiper-id");
        const swiperElement = block.querySelector(".swiper");
        
        if (!swiperElement || !swiperId) {
            console.warn("Team Swiper: Missing swiper element or ID");
            return;
        }
        
        // Check if we're in editor environment
        if (document.body.classList.contains("block-editor-iframe__body")) {
            // In editor - don't initialize Swiper, just show cards
            setupEditorView(block);
            return;
        }
        
        // Load Swiper CSS if not already loaded
        loadSwiperCSS().then(() => {
            // Load Swiper JS
            loadSwiperJS().then(() => {
                initializeSwiper(swiperElement, swiperId);
            }).catch(error => {
                console.error("Failed to load Swiper JS:", error);
                setupFallbackView(block);
            });
        }).catch(error => {
            console.error("Failed to load Swiper CSS:", error);
            setupFallbackView(block);
        });
    }
    
    /**
     * Load Swiper CSS
     */
    function loadSwiperCSS() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector('link[href*="swiper"]')) {
                resolve();
                return;
            }
            
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
            link.onload = () => resolve();
            link.onerror = () => reject(new Error("Failed to load Swiper CSS"));
            document.head.appendChild(link);
        });
    }
    
    /**
     * Load Swiper JS
     */
    function loadSwiperJS() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.Swiper) {
                resolve();
                return;
            }
            
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
            script.onload = () => {
                if (window.Swiper) {
                    resolve();
                } else {
                    reject(new Error("Swiper not available after loading"));
                }
            };
            script.onerror = () => reject(new Error("Failed to load Swiper JS"));
            document.head.appendChild(script);
        });
    }
    
    /**
     * Initialize Swiper instance
     */
    function initializeSwiper(swiperElement, swiperId) {
        try {
            const swiperConfig = {
                // Basic configuration
                slidesPerView: "auto",
                spaceBetween: 24, // 1.5rem
                centeredSlides: false,
                grabCursor: true,
                
                // Navigation
                navigation: {
                    nextEl: swiperElement.querySelector(".swiper-button-next"),
                    prevEl: swiperElement.querySelector(".swiper-button-prev"),
                },
                
                // Responsive breakpoints
                breakpoints: {
                    320: {
                        spaceBetween: 16, // 1rem
                        centeredSlides: true,
                    },
                    768: {
                        spaceBetween: 20,
                        centeredSlides: false,
                    },
                    1024: {
                        spaceBetween: 24,
                        centeredSlides: false,
                    }
                },
                
                // Performance
                watchOverflow: true,
                
                // Accessibility
                a11y: {
                    enabled: true,
                    prevSlideMessage: "Previous slide",
                    nextSlideMessage: "Next slide",
                },
                
                // Keyboard control
                keyboard: {
                    enabled: true,
                    onlyInViewport: true,
                },
                
                // Events
                on: {
                    init: function() {
                        // console.log("Team Swiper initialized:", swiperId);
                        // // Add loaded class for CSS animations
                        // swiperElement.closest(".wp-block-asari-team-swiper").classList.add("swiper-loaded");
                    },
                    slideChange: function() {
                        // updateSlideStates(this);
                    },
                    reachBeginning: function() {
                        // updateNavigationState(this);
                    },
                    reachEnd: function() {
                        // updateNavigationState(this);
                    }
                }
            };
            
            // Initialize Swiper
            const swiperInstance = new window.Swiper(swiperElement, swiperConfig);
            
            // Store instance for cleanup
            swiperInstances.set(swiperId, swiperInstance);
            
            // Setup additional interactions
            setupHoverEffects(swiperElement);
            
        } catch (error) {
            console.error("Failed to initialize Swiper:", error);
            setupFallbackView(swiperElement.closest(".wp-block-asari-team-swiper"));
        }
    }
    
    /**
     * Update slide states for animations
     */
    // function updateSlideStates(swiper) {
    //     const slides = swiper.slides;
    //     slides.forEach((slide, index) => {
    //         slide.classList.remove("slide-prev", "slide-active", "slide-next");
            
    //         if (index === swiper.activeIndex) {
    //             slide.classList.add("slide-active");
    //         } else if (index === swiper.activeIndex - 1) {
    //             slide.classList.add("slide-prev");
    //         } else if (index === swiper.activeIndex + 1) {
    //             slide.classList.add("slide-next");
    //         }
    //     });
    // }
    
    /**
     * Update navigation button states
     */
    // function updateNavigationState(swiper) {
    //     const prevButton = swiper.navigation.prevEl;
    //     const nextButton = swiper.navigation.nextEl;
        
    //     if (prevButton) {
    //         prevButton.classList.toggle("swiper-button-disabled", swiper.isBeginning);
    //     }
        
    //     if (nextButton) {
    //         nextButton.classList.toggle("swiper-button-disabled", swiper.isEnd);
    //     }
    // }
    
    /**
     * Setup hover effects for team member cards
     */
    function setupHoverEffects(swiperElement) {
        const memberCards = swiperElement.querySelectorAll(".team-member-card");
        
        memberCards.forEach(card => {
            const link = card.querySelector(".team-member-link");
            const bwImage = card.querySelector(".team-member-bw");
            const colorImage = card.querySelector(".team-member-color");
            
            if (!link || !bwImage || !colorImage) return;
            
            // Preload color image on first hover
            let colorImageLoaded = false;
            
            link.addEventListener("mouseenter", () => {
                if (!colorImageLoaded) {
                    const img = new Image();
                    img.onload = () => {
                        colorImageLoaded = true;
                        card.classList.add("color-image-loaded");
                    };
                    img.src = colorImage.src;
                }
            });
        });
    }
    
    /**
     * Setup editor view (no Swiper functionality)
     */
    function setupEditorView(block) {
        const swiperWrapper = block.querySelector(".swiper");
        const slides = block.querySelectorAll(".swiper-slide");
        
        if (swiperWrapper && slides.length > 0) {
            // Convert to simple grid for editor
            swiperWrapper.style.display = "flex";
            swiperWrapper.style.gap = "var(--wp--preset--spacing--medium)";
            swiperWrapper.style.overflowX = "auto";
            swiperWrapper.style.padding = "var(--wp--preset--spacing--small) 0";
            
            // Hide navigation in editor
            const navButtons = block.querySelectorAll(".swiper-button-prev, .swiper-button-next");
            navButtons.forEach(button => {
                button.style.display = "none";
            });
        }
        
        block.classList.add("editor-view");
    }
    
    /**
     * Setup fallback view if Swiper fails to load
     */
    function setupFallbackView(block) {
        const swiperWrapper = block.querySelector(".swiper");
        const slides = block.querySelectorAll(".swiper-slide");
        
        if (swiperWrapper && slides.length > 0) {
            // Convert to responsive grid
            swiperWrapper.style.display = "grid";
            swiperWrapper.style.gridTemplateColumns = "repeat(auto-fit, minmax(270px, 1fr))";
            swiperWrapper.style.gap = "var(--wp--preset--spacing--large)";
            swiperWrapper.style.padding = "var(--wp--preset--spacing--medium) 0";
            
            // Hide navigation
            const navButtons = block.querySelectorAll(".swiper-button-prev, .swiper-button-next");
            navButtons.forEach(button => {
                button.style.display = "none";
            });
        }
        
        block.classList.add("fallback-view");
        console.warn("Team Swiper: Using fallback grid view");
    }
    
    /**
     * Handle window resize
     */
    function handleResize() {
        swiperInstances.forEach((swiper, id) => {
            if (swiper && typeof swiper.update === "function") {
                swiper.update();
            }
        });
    }
    
    /**
     * Cleanup function
     */
    function cleanup() {
        swiperInstances.forEach((swiper, id) => {
            if (swiper && typeof swiper.destroy === "function") {
                swiper.destroy(true, true);
            }
        });
        swiperInstances.clear();
    }
    
    /**
     * Initialize everything
     */
    function init() {
        initTeamSwiperBlocks();
        
        // Debounced resize handler
        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });
        
        // Re-initialize on dynamic content loading
        if (typeof window.wp !== "undefined" && window.wp.hooks) {
            window.wp.hooks.addAction("asari.contentLoaded", "asari/team-swiper", initTeamSwiperBlocks);
        }
    }
    
    /**
     * Initialize when DOM is ready
     */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
    
    // Expose API for external use
    window.asariTeamSwiper = {
        init: initTeamSwiperBlocks,
        cleanup: cleanup,
        getInstance: (id) => swiperInstances.get(id)
    };
    
})();